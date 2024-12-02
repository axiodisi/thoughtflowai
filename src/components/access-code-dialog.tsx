export const AccessCodeDialog = ({ onCodeSubmit }: AccessCodeDialogProps) => {
  const [open, setOpen] = useState(true);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  // Check code when component mounts
  useEffect(() => {
    const savedCode = localStorage.getItem("thoughtflow-code");
    if (savedCode) {
      validateAndSetCode(savedCode);
    }
  }, []);

  const validateAndSetCode = async (code: string) => {
    const response = await fetch("/api/refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "test", accessCode: code }),
    });

    if (!response.ok) {
      localStorage.removeItem("thoughtflow-code");
      setOpen(true);
      setError("Invalid or expired code");
      return;
    }

    onCodeSubmit(code);
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    validateAndSetCode(code);
  };

  return open ? (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
      {/* Rest of JSX unchanged */}
    </div>
  ) : null;
};
