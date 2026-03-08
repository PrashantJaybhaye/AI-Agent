import { SignIn } from "@/components/clerk/SignIn";

export default function SignInScreen() {
    return (
        <SignIn signUpUrl="/sign-up" scheme="siora" homeUrl="(protected)" />
    );
}
