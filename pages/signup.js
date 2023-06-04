import axios from "axios";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  CircleNotch,
  Eye,
  GoogleLogo,
  Link,
  Share,
} from "@phosphor-icons/react";
import { useState } from "react";
import { auth } from "../firebase";
import cookie from "js-cookie";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [showpassword, setshowpassword] = useState(false);
  const [loading, setloading] = useState(false);
  const router = useRouter();
  const [userdata, setuserdata] = useState({
    email: "",
    password: "",
    fullname: "",
    confirmpassword: "",
  });

  async function createuserwithEmail() {
    if (userdata.fullname.length < 3) {
      return alert("please add a valid name");
    }
    if (userdata.email.length < 6) {
      return alert("please add a valid email");
    }
    if (userdata.password.length < 8) {
      return alert("password must be min of 8 characters");
    }
    if (userdata.password !== userdata.confirmpassword) {
      return alert("password doesn't match");
    }

    setloading(true);
    await createUserWithEmailAndPassword(
      auth,
      userdata.email.trim(),
      userdata.password.trim()
    )
      .then(async (userCredential) => {
        const user = userCredential.user;
        console.log(user);
        const data = {
          accessToken: user.accessToken,
          displayName: userdata?.fullname,
          email: user.email,
          emailVerified: user.emailVerified,
          isAnonymous: user.isAnonymous,
          phoneNumber: user.phoneNumber,
          photoURL: `https://ui-avatars.com/api/?name=${userdata.fullname}`,
          uid: user.uid,
          metadata: user.metadata,
          _id: user.uid,
          id: user.uid,
        };
        await axios
          .get(`https://contacts-app-server-raavs7xmda-el.a.run.app/users/${user.uid}`)
          .then(async (res) => {
            console.log(res.data);
            if (res?.data?.user === null) {
              await axios
                .request({
                  url: `https://contacts-app-server-raavs7xmda-el.a.run.app/users`,
                  method: "POST",
                  headers: { Accept: "*/*" },
                  data: data,
                })
                .then((response) => {
                  console.log(response.data);
                  sendEmailVerification(userCredential.user);
                  router.push("/verifyemail?token=" + data.accessToken);
                  return;
                })
                .catch((err) => console.log(err));
            } else {
              alert("user already exist, please login to continue");
              router.push("/");
              return;
            }
          });
      })
      .catch((error) => {
        alert(error.message);
        setloading(false);
      });
  }
  async function createuserwithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const data = {
          accessToken: user.accessToken,
          displayName: user.displayName,
          email: user.email,
          emailVerified: user.emailVerified,
          isAnonymous: user.isAnonymous,
          phoneNumber: user.phoneNumber,
          photoURL: user.photoURL,
          uid: user.uid,
          metadata: user.metadata,
          _id: user.uid,
          id: user.uid,
        };

        await axios
          .get(`https://contacts-app-server-raavs7xmda-el.a.run.app/users/${user.uid}`)
          .then(async (res) => {
            if (res?.data?.user === null) {
              await axios
                .request({
                  url: `https://contacts-app-server-raavs7xmda-el.a.run.app/users`,
                  method: "POST",
                  headers: { Accept: "*/*" },
                  data: data,
                })
                .then((response) => {
                  console.log(response?.data);
                  cookie.set("auth", JSON.stringify(response?.data?.user), {
                    path: "/",
                  });
                  router.push("/app");
                  return;
                })
                .catch((err) => console.log(err));
            } else {
              alert("user already exist, please login to continue");
              router.push("/");
              return;
            }
          });
      })
      .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
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
          <p className="text-[#0F172A] text-2xl mb-3 font-medium">Sign up</p>
          <p className="text-[#64748B]">
            Sign up to your account to start using Contacts App
          </p>

          <div className="w-2/3 max-w-[520px] space-y-5 mt-10">
            <div className="w-full">
              <p className="">Full Name</p>
              <input
                type="text"
                placeholder="ex: Jhon Doe"
                onChange={(event) =>
                  setuserdata({ ...userdata, fullname: event.target.value })
                }
                className="focus:border-[#494b4e] px-5 h-12 w-full border-[2px] rounded-[0.25rem]  border-[#F0F3F7] bg-transparent text-[0.875rem] leading-[1.25rem] focus:outline-none block"
              />
            </div>
            <div className="w-full">
              <p className="">Email</p>
              <input
                type="text"
                placeholder="abx@xyz.com"
                onChange={(event) =>
                  setuserdata({ ...userdata, email: event.target.value })
                }
                className="focus:border-[#494b4e] px-5 h-12 w-full border-[2px] rounded-[0.25rem]  border-[#F0F3F7] bg-transparent text-[0.875rem] leading-[1.25rem] focus:outline-none block"
              />
            </div>
            <div className="w-full">
              <p className="">Password</p>
              <div className="w-full relative">
                <Eye
                  size={32}
                  color="#A0AEC0"
                  className="absolute h-12 right-5 cursor-pointer"
                  onClick={() => setshowpassword(!showpassword)}
                />
                <input
                  type={showpassword === true ? "text" : "password"}
                  placeholder="********"
                  onChange={(event) =>
                    setuserdata({ ...userdata, password: event.target.value })
                  }
                  className="focus:border-[#494b4e] px-5 h-12 w-full border-[2px] rounded-[0.25rem]  border-[#F0F3F7] bg-transparent text-[0.875rem] leading-[1.25rem] focus:outline-none block"
                />
              </div>
            </div>
            <div className="w-full">
              <p className="">Password</p>
              <div className="w-full relative">
                <Eye
                  size={32}
                  color="#A0AEC0"
                  className="absolute h-12 right-5 cursor-pointer"
                  onClick={() => setshowpassword(!showpassword)}
                />
                <input
                  type={showpassword === true ? "text" : "password"}
                  placeholder="********"
                  onChange={(event) =>
                    setuserdata({
                      ...userdata,
                      confirmpassword: event.target.value,
                    })
                  }
                  className="focus:border-[#494b4e] px-5 h-12 w-full border-[2px] rounded-[0.25rem]  border-[#F0F3F7] bg-transparent text-[0.875rem] leading-[1.25rem] focus:outline-none block"
                />
              </div>
            </div>
            <div className="w-full">
              <button
                onClick={() => createuserwithEmail()}
                className="bg-[#0F172A] hover:bg-[#0F172A] text-white font-medium py-2 px-4 rounded relative w-full flex items-center justify-center"
              >
                {loading === true ? (
                  <div className="animate-spin">
                    <CircleNotch size={26} color="white" weight="bold" />
                  </div>
                ) : (
                  "Sign up"
                )}
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
              <button
                onClick={() => createuserwithGoogle()}
                className="bg-[#0F172A] group hover:bg-[#0F172A] text-white shadow-md border font-medium py-2 px-4 rounded relative w-full"
              >
                <GoogleLogo
                  size={26}
                  weight="bold"
                  className="absolute text-white "
                />
                Sign up with google
                <span className="absolute top-[-4px] left-[-4px] right-[-4px] bottom-[-4px] border-transparent border-2 hover:border-[#3F4555] rounded-md"></span>
              </button>
            </div>
            <div className="flex justify-center mt-10 pb-10">
              <button className="hover:underline underline-offset-2">
                ALREADY HAVING AN ACCOUNT?{" "}
                <span
                  className="font-semibold"
                  onClick={() => router.push("/")}
                >
                  SIGN IN
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
Home.layout = "Nolayout";
