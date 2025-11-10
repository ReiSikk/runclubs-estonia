import React, {useEffect} from "react";
import { Toast } from "radix-ui";
import styles from "./Toast.module.css";
import { LucideX } from "lucide-react";

interface FormToastProps {
  message: string;
  type: "success" | "error";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FormToast({ message, type, open, onOpenChange}: FormToastProps) {
	const timerRef = React.useRef(0);

	  useEffect(() => {
      const timer = timerRef.current;
      
      return () => clearTimeout(timer);
    }, []);

	return (
	    <Toast.Provider swipeDirection="right">
      <Toast.Root
        className={`${styles.Root} ${type === "success" ? styles.success : styles.error}`}
        open={open}
        onOpenChange={onOpenChange}
        duration={3000}
      >
        <div className={`${styles.overlay} ${type === "success" ? styles.success : styles.error}`}></div>
        <Toast.Title className={`${styles.Title} h5`}>
          {type === "success" ? "Success!" : "Error submitting form"}
        </Toast.Title>
        <Toast.Description className={`${styles.Description} txt-body`}>
          {message}
        </Toast.Description>
        <Toast.Close className={styles.Close}>
          <LucideX size={24} strokeWidth={2}/>
        </Toast.Close>
      </Toast.Root>
      <Toast.Viewport className={styles.Viewport} />
    </Toast.Provider>
	);
};
