"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User, Briefcase, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

type AuthStep = "choice" | "signin" | "signup-profile" | "signup-credentials" | "google-profile"

export function AuthModal({ triggerId = "open-auth" }: { triggerId?: string }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<AuthStep>("choice")
  const [loading, setLoading] = useState(false)
  const [googleData, setGoogleData] = useState<any>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    company: "",
    role: "",
  })

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.id === triggerId || target.closest(`#${triggerId}`)) {
        setOpen(true)
        setStep("choice")
      }
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [triggerId])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithEmail(formData.email, formData.password)
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      })
      setOpen(false)
      // Redirect to dashboard
      window.location.href = "/dashboard"
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const result = await signInWithGoogle()
      
      if (result.needsProfile) {
        // New user - need to collect profile info
        setGoogleData(result)
        setStep("google-profile")
      } else {
        // Existing user - redirect
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in with Google.",
        })
        setOpen(false)
        window.location.href = "/dashboard"
      }
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleProfileComplete = async () => {
    setLoading(true)
    try {
      await signInWithGoogle(formData.fullName, formData.company)
      toast({
        title: "Account created!",
        description: "Welcome to Recruit AI!",
      })
      setOpen(false)
      window.location.href = "/dashboard"
    } catch (error: any) {
      toast({
        title: "Profile setup failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUpProfileNext = () => {
    if (!formData.fullName || !formData.company) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }
    setStep("signup-credentials")
  }

  const handleSignUpComplete = async () => {
    setLoading(true)
    try {
      await signUpWithEmail(
        formData.email,
        formData.password,
        formData.fullName,
        formData.company
      )
      toast({
        title: "Account created!",
        description: "Welcome to Recruit AI!",
      })
      setOpen(false)
      window.location.href = "/dashboard"
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md glass-effect border-white/20">
        <AnimatePresence mode="wait">
          {step === "choice" && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl gradient-text">Welcome to Recruit AI</DialogTitle>
                <DialogDescription>Choose how you'd like to continue</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-6">
                <Button 
                  className="w-full bg-white text-black hover:bg-white/90 h-12 group" 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full h-12" onClick={() => setStep("signin")}>
                  Sign In with Email
                </Button>
                <Button 
                  className="w-full bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90 h-12"
                  onClick={() => setStep("signup-profile")}
                >
                  Create Account
                </Button>
              </div>
            </motion.div>
          )}

          {step === "signin" && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl">Sign In</DialogTitle>
                <DialogDescription>Enter your credentials to continue</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-[#03b2cb] to-[#00999e]" 
                  onClick={handleSignIn}
                  disabled={loading || !formData.email || !formData.password}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep("choice")} disabled={loading}>
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {step === "signup-profile" && (
            <motion.div
              key="signup-profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl">Tell us about yourself</DialogTitle>
                <DialogDescription>We'll use this to personalize your experience</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="profile-name"
                      placeholder="John Doe"
                      className="pl-10"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-company">Company Name *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="profile-company"
                      placeholder="Acme Inc."
                      className="pl-10"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-[#03b2cb] to-[#00999e]" 
                  onClick={handleSignUpProfileNext}
                  disabled={!formData.fullName || !formData.company}
                >
                  Continue
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep("choice")}>
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {step === "signup-credentials" && (
            <motion.div
              key="signup-credentials"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl">Create your account</DialogTitle>
                <DialogDescription>Choose your login credentials</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-[#03b2cb] to-[#00999e]" 
                  onClick={handleSignUpComplete}
                  disabled={loading || !formData.email || !formData.password || formData.password.length < 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep("signup-profile")} disabled={loading}>
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {step === "google-profile" && (
            <motion.div
              key="google-profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl">Complete Your Profile</DialogTitle>
                <DialogDescription>Tell us about yourself to finish setup</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="google-profile-name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="google-profile-name"
                      placeholder="John Doe"
                      className="pl-10"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google-profile-company">Company Name *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="google-profile-company"
                      placeholder="Acme Inc."
                      className="pl-10"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-[#03b2cb] to-[#00999e]" 
                  onClick={handleGoogleProfileComplete}
                  disabled={loading || !formData.fullName || !formData.company}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing setup...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
