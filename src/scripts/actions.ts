import { toast } from "sonner";

export function handleError(error: Error) {
    console.error("Error:", error);
    toast.error(`Error: ${error.message}`);
}

export function handleSuccess(message: string) {
    console.log("Success:", message);
    toast.success(message);
}