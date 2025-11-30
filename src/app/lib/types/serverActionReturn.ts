export type FormState =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
      errors?: Record<string, string[]>;
      fieldValues?: Record<string, unknown>;
    }
  | undefined;