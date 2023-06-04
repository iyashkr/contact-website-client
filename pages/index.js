import { auth } from '../firebase';
import { GoogleAuthProvider, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import Image from 'next/image'
import { useRouter } from 'next/router';
import { CircleNotch, Eye, GoogleLogo, Share } from '@phosphor-icons/react'
import { useState } from 'react'
import cookie from 'js-cookie';
import axios from 'axios';
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [showpassword, setshowpassword] = useState(false);
  const [loading, setloading] = useState(false)
  const [userdata, setuserdata] = useState({
    email: '',
    password: ''
  });
  const router = useRouter();


  async function signinByEmail() {
    if (userdata.email.length < 6) {
      return alert("please add a valid email");
    }
    if (userdata.password.length < 8) {
      return alert("password must be min of 8 characters");
    }
    setloading(true)
    await signInWithEmailAndPassword(auth, userdata.email.trim(), userdata.password.trim())
      .then(async (userCredential) => {
        const user = userCredential.user;
        await axios.get(`http://localhost:8080/users/${user.uid}`).then(async (res) => {
          console.log(res)
          if (res?.data?.user !== null) {
            if (res?.data?.user?.emailVerified === false) {
              sendEmailVerification(userCredential.user);
              router.push(`/verifyemail?token=${user.accessToken}`)
              console.log(user)
              return
            }
            if (res?.data?.user?.emailVerified === true) {
              cookie.set('auth', JSON.stringify(res?.data?.user), { path: '/' });
              router.replace("/app")
              return
            }
          }
          else {
            return alert("No user found, please signup")
          }
        })
        // cookie.set('auth', JSON.stringify(userCredential.user), { path: '/' });
        // router.replace("/admin")
      }).catch(err => {
        alert(err.message);
        setloading(false)
      })
  }

  async function signinByGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        await axios.get(`http://localhost:8080/users/${user.uid}`).then(async (res) => {
          console.log(res)
          if (res?.data?.user !== null) {
            if (res?.data?.user?.emailVerified === true) {
              cookie.set('auth', JSON.stringify(res?.data?.user), { path: '/' });
              router.replace("/app")
              return
            }
          }
          else {
            alert("No user found, please signup")
            router.push(`/signup`)
            return
          }
        })
      }).catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage)
        return
      });
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
          <p className="text-[#0F172A] text-2xl mb-3 font-medium">Sign in</p>
          <p className="text-[#64748B]">Sign in to your account to start using Contacts App</p>

          <div className="w-2/3 max-w-[520px] space-y-5 mt-10">
            <div className="w-full">
              <p className="">Email</p>
              <input
                type="text"
                onChange={(event) => setuserdata({ ...userdata, email: event.target.value })}
                placeholder="abx@xyz.com"
                className="focus:border-[#494b4e] px-5 h-12 w-full border-[2px] rounded-[0.25rem]  border-[#F0F3F7] bg-transparent text-[0.875rem] leading-[1.25rem] focus:outline-none block"
              />
            </div>
            <div className="w-full">
              <p className="">Password</p>
              <div className="w-full relative">
                <Eye size={32} color="#A0AEC0" className="absolute h-12 right-5" onClick={() => setshowpassword(!showpassword)} />
                <input
                  type={showpassword === true ? "text" : "password"}
                  onChange={(event) => setuserdata({ ...userdata, password: event.target.value })}
                  placeholder="********"
                  className="focus:border-[#494b4e] px-5 h-12 w-full border-[2px] rounded-[0.25rem]  border-[#F0F3F7] bg-transparent text-[0.875rem] leading-[1.25rem] focus:outline-none block"
                />
              </div>
            </div>
            <div className="w-full">
              <button onClick={() => signinByEmail()} className="bg-[#0F172A] hover:bg-[#0F172A] text-white font-medium py-2 px-4 rounded relative w-full flex items-center justify-center">
                {loading === true ? <div className="animate-spin"><CircleNotch size={26} color="white" weight='bold' /></div> : "Sign in"}
                <span className="absolute top-[-4px] left-[-4px] right-[-4px] bottom-[-4px] border-transparent border-2 hover:border-[#3F4555] rounded-md"></span>
              </button>
            </div>
          </div>
          <div className="w-2/3 max-w-[520px] space-y-5 ">
            <div className="relative border-b-[#9AA2AF] border-opacity-[16%] border-b pt-6">
              <div className="absolute inline-block bg-white dark:bg-slate-800 dark:text-slate-400 left-1/2 top-1/2 transform -translate-x-1/2 px-4 min-w-max text-sm text-slate-500 font-normal">
                Or continue with
              </div>
            </div>
            <div className="mt-6 w-full">
              <button onClick={() => signinByGoogle()} className="bg-[#0F172A] group hover:bg-[#0F172A] text-white shadow-md border font-medium py-2 px-4 rounded relative w-full">
                <GoogleLogo size={26} weight='bold' className='absolute text-white ' />
                Sign in with google
                <span className="absolute top-[-4px] left-[-4px] right-[-4px] bottom-[-4px] border-transparent border-2 hover:border-[#3F4555] rounded-md"></span>
              </button>
            </div>
            <div className="flex justify-center mt-10 pb-10">
              <button className="hover:underline underline-offset-2">DON’T HAVE AN ACCOUNT? <span className="font-semibold" onClick={() => router.push("/signup")} >SIGN UP</span></button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
Home.layout = "Nolayout";