import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';
interface GeminiResponse {
  results?: Array<Record<string, any>>;
  match?: Array<{ id: number; title?: string; name?: string; score: number }>;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private http: HttpClient) {}

  sendQuery(prompt: string): Observable<string> {
    return this.http.post<GeminiResponse>(`${environment.apiUrl}/gemini/query`, { prompt }).pipe(
      map((data) => this.formatResponse(data))
    );
  }

  private formatResponse(data: GeminiResponse): string {
    if (data.error) {
      return `Error: ${data.error}`;
    }

    if (Array.isArray(data.results)) {
      if (data.results.length === 0) return 'No results found.';
      return data.results
        .map((row) => {
          if ('first_name' in row) {
            // User (employer/seeker) results
            return `User: ${row['first_name']} ${row['second_name']} (ID: ${row['id']}, Email: ${row['email']}, Role: ${
              row['role_id'] === 1 ? 'Admin' : row['role_id'] === 2 ? 'Employer' : 'Seeker'
            })`;
          } else if ('title' in row) {
            // Job results
            return `Job: ${row['title']} (ID: ${row['id']}, Status: ${row['status']}, Employer ID: ${row['employer_id']})`;
          } else if ('count' in row) {
            // Analytics results
            return `Analytics: ${JSON.stringify(row)}`;
          }
          return JSON.stringify(row);
        })
        .join('\n');
    } else if (data.match) {
      // Matching results (e.g., job/seeker matches for analytics)
      return data.match
        .map((item) => {
          if ('title' in item) {
            return `Job Match: ${item.title} (ID: ${item.id}, Score: ${item.score}%)`;
          } else {
            return `User Match: ${item.name} (ID: ${item.id}, Score: ${item.score}%)`;
          }
        })
        .join('\n');
    }
    return JSON.stringify(data);
  }
}