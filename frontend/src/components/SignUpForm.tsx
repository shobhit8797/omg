import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export const SignUpForm = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Construct the request body
        const userData = {
            username: `${firstName}_${lastName}`, // Combine first and last name
            email,
            password,
        };

        try {
            console.log(userData);
            const response = await axios.post(
                "http://localhost:8000/signup",
                userData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setFirstName("");
            setLastName("");
            setEmail("");
            setPassword("");
            window.location.href = "/signin";
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                console.log(err.response.data.error);
                // setError(err.response.data.error);
            } else {
                console.log("Failed to sign up. Please try again.");
                // setError("Failed to sign up. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-xl">Sign Up</CardTitle>
                <CardDescription>
                    Your data is safe with us.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first-name">First name</Label>
                                <Input
                                    id="first-name"
                                    placeholder="Max"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last-name">Last name</Label>
                                <Input
                                    id="last-name"
                                    placeholder="Robinson"
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating account..."
                                : "Create an account"}
                        </Button>
                    </div>
                </form>

                <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link to="/signin" className="underline">
                        Sign in
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};
