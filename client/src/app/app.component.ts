import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/skipWhile';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/throttleTime';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  message: string;
  messages: Object[] = [];
  secretCode: string;

  constructor(private chatService: ChatService) {
    this.secretCode = 'DONT TELL';
  }

  sendMessage() {
    this.chatService.sendMessage(JSON.stringify({text:this.message}));
    this.message = '';
  }

  ngOnInit() {
    this.chatService
      .getMessages()
      .distinctUntilChanged()
      // .filter((message) => message.trim().length > 0)
      .throttleTime(1000)
      // .skipWhile((message) => message !== this.secretCode)
      // .scan((acc: string, message: string, index: number) =>
      //   `${message}(${index + 1})`
      //   , 1)
      .subscribe((message: string) => {
        const currentTime = moment().format('hh:mm:ss a');
        let messageWithTimestamp = "";
        let parsedObj:any=JSON.parse(message);
      
       
        if (parsedObj.img) {
          messageWithTimestamp = `${currentTime}`;
          this.messages.push({text:messageWithTimestamp, img:parsedObj.img._imageAsDataUrl});
        }
        else {
          messageWithTimestamp = `${currentTime}: ${parsedObj.text}`;
          this.messages.push({text:messageWithTimestamp});
        }
      });

    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };

  public errors: WebcamInitError[] = [];

  // latest snapshot
  public webcamImage: WebcamImage = null;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();
  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    console.info('received webcam image', webcamImage);
    this.webcamImage = webcamImage;

    //send message
    this.chatService.sendMessage(JSON.stringify({img:this.webcamImage}));
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }




}
