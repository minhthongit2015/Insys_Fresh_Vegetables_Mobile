import { BluetoothCtl } from "./bluetoothctl";
// import io from 'socket.io-client';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the TCPServices provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

@Injectable()
export class LANServices {

  constructor(public http: Http, public bls: BluetoothCtl) {
		console.log('Hello TCPServices Provider');
		// var socket = new WebSocket()
  }

	arrayBuffer2str(buf) {
		var str= '';
		var ui8= new Uint8Array(buf);
		for (var i= 0 ; i < ui8.length ; i++) {
			str= str+String.fromCharCode(ui8[i]);
		}
		return str;
	}

	str2arrayBuffer(str) {
		var buf= new ArrayBuffer(str.length);
		var bufView= new Uint8Array(buf);
		for (var i= 0 ; i < str.length ; i++) {
			bufView[i]= str.charCodeAt(i);
  		}
		return buf;
	}

	sendPacket(ipAddr,ipPort,data) {
		var delay= 5000;	/// 5 seconds timeout
		(<any>window).chrome.sockets.tcp.create({}, createInfo => { //callback function with createInfo as the parameter
			var _socketTcpId= createInfo.socketId;
			(<any>window).chrome.sockets.tcp.connect(_socketTcpId, ipAddr, ipPort, result => { //callback function with result as the parameter
				if (result === 0) {
					var data2send= this.str2arrayBuffer(data);
					/// connection ok, send the packet
					(<any>window).chrome.sockets.tcp.send(_socketTcpId, data2send);
				}
			});
			(<any>window).chrome.sockets.tcp.onReceive.addListener( info => { //callback function with info as the parameter
				/// recived, then close connection
				(<any>window).chrome.sockets.tcp.close(_socketTcpId);
				var data = this.arrayBuffer2str(info.data);
				console.log(data);
			});
			/// set the timeout
			setTimeout(function() {
				(<any>window).chrome.sockets.tcp.close(_socketTcpId);
			}, delay);
		});
	}
}