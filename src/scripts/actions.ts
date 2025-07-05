import { toast } from "sonner";

// Handles error cases by logging the error to console and displaying an error toast notification
export function handleError(error: Error) {
    console.error("Error:", error);
    toast.error(`Error: ${error.message}`);
}

// Handles success cases by logging the success message to console and displaying a success toast notification
export function handleSuccess(message: string) {
    console.log("Success:", message);
    toast.success(message);
}