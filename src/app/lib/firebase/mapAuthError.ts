export default function mapAuthError(error: unknown): string {
  if (!error) return "An unknown error occurred.";
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    if (error.code === "auth/email-already-in-use") {
      return "This email is already registered.";
    } else if (error.code === "auth/invalid-email") {
      return "Invalid email address.";
    } else if (error.code === "auth/weak-password") {
      return "Password is too weak.";
    } else if (error.code === "auth/invalid-credential") {
      return "Invalid email or password provided. Please try again.";
    }
  }
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Sign up failed";
}