import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Loader2, Phone, Mail } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const phoneSchema = z.object({
  phone: z.string().min(8, "Enter a valid phone number"),
  password: z.string().min(1, "Password is required"),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type PhoneFormValues = z.infer<typeof phoneSchema>;
type Step = "choose" | "email" | "phone";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const [step, setStep] = useState<Step>("choose");
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "" },
  });

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "", password: "" },
  });

  const onEmailSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);
    try {
      await login(data);
    } finally {
      setIsLoading(false);
    }
  };

  const onPhoneSubmit = async (data: PhoneFormValues) => {
    setIsLoading(true);
    try {
      await login({
        email: `${data.phone.replace(/\s+/g, "")}@bfc.phone`,
        password: data.password,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">

          {step === "choose" && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100">
              <div className="p-8 pb-6">
                <h1 className="text-2xl font-black tracking-tight mb-1">Welcome!</h1>
                <p className="text-sm text-zinc-500 mb-6">Sign up or log in to continue</p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setStep("email")}
                    className="flex items-center justify-center gap-3 w-full h-12 rounded-lg font-semibold text-white text-sm transition hover:opacity-90 active:scale-[0.98]"
                    style={{ backgroundColor: "#1877F2" }}
                  >
                    <FacebookIcon />
                    Continue with Facebook
                  </button>

                  <button
                    onClick={() => setStep("email")}
                    className="flex items-center justify-center gap-3 w-full h-12 rounded-lg font-semibold text-zinc-800 text-sm border border-zinc-300 bg-white transition hover:bg-zinc-50 active:scale-[0.98]"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>

                  <button
                    onClick={() => setStep("phone")}
                    className="flex items-center justify-center gap-3 w-full h-12 rounded-lg font-semibold text-zinc-800 text-sm border border-zinc-300 bg-white transition hover:bg-zinc-50 active:scale-[0.98]"
                  >
                    <Phone className="w-5 h-5 text-zinc-600" />
                    Continue with Phone Number
                  </button>
                </div>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-zinc-200" />
                  <span className="text-xs text-zinc-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-zinc-200" />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setStep("email")}
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-lg font-bold text-sm text-white transition hover:opacity-90 active:scale-[0.98]"
                    style={{ backgroundColor: "#E8472A" }}
                  >
                    <Mail className="w-4 h-4" />
                    Log in with Email
                  </button>

                  <Link href="/signup">
                    <button className="flex items-center justify-center w-full h-12 rounded-lg font-bold text-sm text-zinc-800 border-2 border-zinc-200 bg-white transition hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98]">
                      Sign up
                    </button>
                  </Link>
                </div>
              </div>

              <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-100 text-center text-xs text-zinc-400">
                By signing in, you agree to our{" "}
                <span className="text-orange-500 font-medium cursor-pointer hover:underline">Terms and Conditions</span>{" "}
                and{" "}
                <span className="text-orange-500 font-medium cursor-pointer hover:underline">Privacy Policy</span>.
              </div>
            </div>
          )}

          {step === "email" && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100">
              <div className="p-8 pb-6">
                <button
                  onClick={() => setStep("choose")}
                  className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-zinc-700 mb-6 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <h1 className="text-2xl font-black tracking-tight mb-1">Log In</h1>
                <p className="text-sm text-zinc-500 mb-6">Enter your email and password</p>

                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <FormField control={emailForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-zinc-700">Email</FormLabel>
                        <FormControl><Input placeholder="name@example.com" className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={emailForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-zinc-700">Password</FormLabel>
                        <FormControl><Input type="password" autoComplete="current-password" placeholder="••••••••" className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full h-12 text-base font-bold mt-2" style={{ backgroundColor: "#E8472A" }} disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      Sign In
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-zinc-400">Don't have an account? </span>
                  <Link href="/signup"><span className="font-bold text-orange-500 hover:underline cursor-pointer">Sign up</span></Link>
                </div>
              </div>
            </div>
          )}

          {step === "phone" && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100">
              <div className="p-8 pb-6">
                <button
                  onClick={() => setStep("choose")}
                  className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-zinc-700 mb-6 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <h1 className="text-2xl font-black tracking-tight mb-1">Log In</h1>
                <p className="text-sm text-zinc-500 mb-6">Enter your phone number and password</p>

                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                    <FormField control={phoneForm.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-zinc-700">Phone Number</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <div className="flex items-center h-12 px-3 border rounded-md bg-zinc-50 text-sm font-semibold text-zinc-600 shrink-0">+855</div>
                            <Input placeholder="012 345 678" className="h-12" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={phoneForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-zinc-700">Password</FormLabel>
                        <FormControl><Input type="password" autoComplete="current-password" placeholder="••••••••" className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full h-12 text-base font-bold mt-2" style={{ backgroundColor: "#E8472A" }} disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      Sign In
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-zinc-400">Don't have an account? </span>
                  <Link href="/signup"><span className="font-bold text-orange-500 hover:underline cursor-pointer">Sign up</span></Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
