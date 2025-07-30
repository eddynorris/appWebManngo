import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  answer: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/chat`;

  sendMessage(question: string): Observable<ChatResponse> {
    const payload: ChatRequest = { question };
    return this.http.post<ChatResponse>(this.apiUrl, payload);
  }
}