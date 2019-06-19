import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {WebcamModule} from 'ngx-webcam';

import { AppComponent } from './app.component';
import { ChatService } from 'chat.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    WebcamModule
  ],
  providers: [ChatService],
  bootstrap: [AppComponent]
})
export class AppModule { }
