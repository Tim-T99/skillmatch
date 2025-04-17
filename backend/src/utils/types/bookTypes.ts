import { UserRequest } from "./userTypes";

/**
 * Event type defining structure of an event record in PostgreSQL
 */
export interface Book {
        book_id: number,
        title: string,
        author: string,
        isbn: number,
        year: number,
        pages: number,
        publisher: string,
        description: string,
        image: string,
        price: number,
        created_by: number,
        created_at: Date,
        updated_at: Date
    }


/**
 * Custom Express Request Type for event-related middleware
 * This extends `UserRequest` so that `req.user` is available
 */
export interface BookRequest extends UserRequest {
  params: {
    id: string; // Ensures `req.params.id` always exists
  };
  book?: Book;
}
