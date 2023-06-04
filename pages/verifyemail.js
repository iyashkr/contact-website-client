import axios from 'axios';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import Image from 'next/image'
import { useRouter } from 'next/router';
import { CircleNotch, Eye, GoogleLogo } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { auth } from "../firebase"
import cookie from 'js-cookie';
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })


export default function VerifyEmail() {
    const [loading, setloading] = useState(false)
    const [user, setuser] = useState({});
    const router = useRouter();

    const { token } = router.query;
    console.log(token)


    useEffect(() => {
        if (token) {
            const intervalId = setInterval(() => {
                VerifyEmail(token)
            }, 10000);
            return () => clearInterval(intervalId)
        }

    }, [token])


    async function VerifyEmail(token) {
        await axios.post("/api/verifytoken", { token: token }).then(async res => {
            await axios.post("/api/getuserfromuid", { uid: res.data?.uid }).then(async res => {
                setuser(res?.data)
                if (res?.data?.emailVerified === true) {
                    await axios.request({ url: `https://contacts-app-server-raavs7xmda-el.a.run.app/users/${res?.data?.uid}`, method: "PUT", headers: { "Accept": "*/*", }, data: { emailVerified: true } }).then(response => {
                        cookie.set('auth', JSON.stringify(response?.data?.user), { path: '/' });
                        router.push("/app")
                        return
                    })
                }
            })
        }).catch(err => console.log(err))

    }
    async function resendEmailVerification() {
        setloading(true)
        sendEmailVerification(user);
        setloading(false)

    }


    return (

        <>
            <div className={`grid lg:grid-cols-2 h-screen w-full ${inter.className}`}>
                <div className="hidden lg:block h-full min-w-full relative border bg-[#F1F5F9] max-w-[520px] overflow-hidden">
                    <div className="relative h-full w-full">
                        <Image src="/login.jpg" alt="left-image" className="" fill />
                    </div>
                </div>
                <div className="h-full w-full flex flex-col items-center p-11">
                    <p className="text-[#0F172A] text-2xl mb-3 font-medium">Sign up</p>
                    <p className="text-[#64748B]">Sign up to your account to start using Contacts App</p>
                    <p className="text-[#64748B] mt-10">Please check your email, we have sent an verification link, after verify email ,please click on verify else relogin</p>

                    <div className="mt-6 w-full">
                        <button onClick={() => VerifyEmail(token)} className="bg-[#0F172A] group hover:bg-[#0F172A] text-white shadow-md border font-medium py-2 px-4 rounded relative w-full">
                            {loading === true ? <div className="animate-spin"><CircleNotch size={26} color="white" weight='bold' /></div> : "Verify"}

                            <span className="absolute top-[-4px] left-[-4px] right-[-4px] bottom-[-4px] border-transparent border-2 hover:border-[#3F4555] rounded-md"></span>
                        </button>
                    </div>
                    {/* <div className="relative border-b-[#9AA2AF] border-opacity-[16%] border-b pt-6">
                        <div className="absolute inline-block bg-white dark:bg-slate-800 dark:text-slate-400 left-1/2 top-1/2 transform -translate-x-1/2 px-4 min-w-max text-sm text-slate-500 font-normal">
                            OR
                        </div>
                    </div> */}
                    {/* <div className="mt-6 w-full">
                        <button onClick={() => resendEmailVerification()} className="bg-[#0F172A] group hover:bg-[#0F172A] text-white shadow-md border font-medium py-2 px-4 rounded relative w-full">
                            {loading === true ? <div className="animate-spin"><CircleNotch size={26} color="white" weight='bold' /></div> : "Resend Verification Link"}

                            <span className="absolute top-[-4px] left-[-4px] right-[-4px] bottom-[-4px] border-transparent border-2 hover:border-[#3F4555] rounded-md"></span>
                        </button>
                    </div> */}
                    <div className="flex justify-center mt-10">
                        <button className="">BACT TO LOGIN? <span className="font-semibold" onClick={() => router.push("/")}>SIGN IN</span></button>
                    </div>
                </div>
            </div>
        </>
    );
}
VerifyEmail.layout = "Nolayout";