import Image from "next/image";
import { Inter } from "next/font/google";
import ContactCard from "@/components/contactCard";
import React, { useRef, useState } from "react";
import { CircleNotch, Plus, SignOut } from "@phosphor-icons/react";
import { auth, storage } from "@/firebase";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import ModalCard from "@/components/modalCard";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { nanoid } from "nanoid";
import axios from "axios";
const inter = Inter({ subsets: ["latin"] });

export const getServerSideProps = async ({ req }) => {
  const authData = req.cookies.auth ? JSON.parse(req.cookies.auth) : null;

  if (!authData || authData === null) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const res = await fetch(
    "https://contacts-app-server-raavs7xmda-el.a.run.app/contacts/byuser/" + authData?.uid
  );
  const contacts = await res.json();
  return { props: { contacts, authData } };
};

export default function Index({ contacts, authData }) {
  const router = useRouter();
  const [userContacts, setuserContacts] = useState(contacts.contacts);
  const [createNewModal, setcreateNewModal] = useState(false);
  const [editModal, seteditModal] = useState(false);
  const [thumbnail, setthumbnail] = useState(null);
  const [addingLoading, setaddingLoading] = useState(false);
  const [deleteLoading, setdeleteLoading] = useState(false);
  const [activeEditCard, setactiveEditCard] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  let nameref = useRef(null);
  let ccoderef = useRef(null);
  let phoneref = useRef(null);

  async function uploadImage(event, setto) {
    const file = event.target.files[0];

    if (!file) {
      alert("No files selected");
      return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
      const image = new window.Image();
      image.onload = async function () {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        let width = image.width;
        let height = image.height;

        if (width !== height) {
          // Image is not square, adjust dimensions to make it square
          const size = Math.min(width, height);
          const x = (width - size) / 2;
          const y = (height - size) / 2;
          canvas.width = size;
          canvas.height = size;
          context.drawImage(image, x, y, size, size, 0, 0, size, size);
          width = size;
          height = size;
        } else {
          // Image is already square
          canvas.width = width;
          canvas.height = height;
          context.drawImage(image, 0, 0, width, height);
        }

        // Compress the image to 100x100 resolution
        const resizedCanvas = document.createElement("canvas");
        const resizedContext = resizedCanvas.getContext("2d");
        const newSize = 250;
        resizedCanvas.width = newSize;
        resizedCanvas.height = newSize;
        resizedContext.drawImage(
          canvas,
          0,
          0,
          width,
          height,
          0,
          0,
          newSize,
          newSize
        );

        // Get the compressed image as a data URL
        const compressedImageUrl = resizedCanvas.toDataURL("image/jpeg", 0.8); // Adjust the quality as needed

        // Upload the compressed image to Firebase Storage
        const fileName = `contact/${authData?.uid}/${nanoid(20)}.jpg`;
        try {
          const storageRef = ref(storage, fileName);
          await uploadString(storageRef, compressedImageUrl, "data_url"); // Use 'data_url' as the format
          const downloadURL = await getDownloadURL(storageRef);
          console.log(downloadURL);
          if (!setto) {
            setthumbnail(downloadURL);
          } else {
            setactiveEditCard({ ...activeEditCard, photo: downloadURL });
          }
        } catch (error) {
          console.error("Error uploading file to Firebase:", error);
        }
      };

      image.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }
  async function addContact() {
    if (!nameref.current.value) {
      return alert("please enter contact name");
    }
    if (!ccoderef.current.value) {
      return alert("please enter country code");
    }
    if (!phoneref.current.value || phoneref.current.value?.length < 10) {
      return alert("please enter valid phone number");
    }
    setaddingLoading(true);

    try {
      let headersList = {
        Accept: "*/*",
        "Content-Type": "application/json",
      };

      let bodyContent = {
        name: nameref.current.value,
        countryCode: ccoderef.current.value,
        phone: phoneref.current.value,
        photo: thumbnail ?? null,
        addedBy: authData?.uid,
      };

      let reqOptions = {
        url: "https://contacts-app-server-raavs7xmda-el.a.run.app/contacts",
        method: "POST",
        headers: headersList,
        data: bodyContent,
      };

      let response = await axios.request(reqOptions);
      setuserContacts((prevContacts) => [
        ...prevContacts,
        { ...bodyContent, _id: response.data.id },
      ]);
      setthumbnail(null);
      nameref.current.value === null;
      ccoderef.current.value === null;
      phoneref.current.value === null;
      setaddingLoading(false);
      setcreateNewModal(false);
    } catch (error) {
      setaddingLoading(false);
      alert(error);
      return;
    }
  }
  async function updateContact() {
    if (!nameref.current.value) {
      return alert("please enter contact name");
    }
    if (!ccoderef.current.value) {
      return alert("please enter country code");
    }
    if (!phoneref.current.value || phoneref.current.value?.length < 10) {
      return alert("please enter valid phone number");
    }
    setaddingLoading(true);

    try {
      let headersList = {
        Accept: "*/*",
        "Content-Type": "application/json",
      };

      let bodyContent = {
        name: nameref.current.value,
        countryCode: ccoderef.current.value,
        phone: phoneref.current.value,
        photo: activeEditCard?.photo ?? null,
        addedBy: authData?.uid,
      };

      let reqOptions = {
        url: "https://contacts-app-server-raavs7xmda-el.a.run.app/contacts/" + activeEditCard?._id,
        method: "PUT",
        headers: headersList,
        data: bodyContent,
      };

      let response = await axios.request(reqOptions);
      setuserContacts((prevContacts) =>
        prevContacts.map((obj) =>
          obj._id === activeEditCard?._id
            ? { ...bodyContent, _id: activeEditCard?._id }
            : obj
        )
      );
      nameref.current.value === null;
      ccoderef.current.value === null;
      phoneref.current.value === null;
      setaddingLoading(false);
      seteditModal(false);
    } catch (error) {
      setaddingLoading(false);
      alert(error);
      return;
    }
  }
  async function deleteContact(id) {
    setdeleteLoading(true);

    try {
      let headersList = {
        Accept: "*/*",
        "Content-Type": "application/json",
      };

      let reqOptions = {
        url: "https://contacts-app-server-raavs7xmda-el.a.run.app/contacts/" + id,
        method: "DELETE",
        headers: headersList,
      };

      let response = await axios.request(reqOptions);
      setuserContacts((prevContacts) =>
        prevContacts.filter((obj) => obj._id !== id)
      );
      setdeleteLoading(false);
      setcreateNewModal(false);
    } catch (error) {
      setdeleteLoading(false);
      alert(error);
      return;
    }
  }
  async function logout() {
    auth.signOut().then(async () => {
      Cookies.remove("auth", { path: "/" });
      router.replace("/");
      router.reload();
      return;
    });
  }

  return (
    <div className={`h-screen overflow-y-auto w-full ${inter.className}`}>
      {createNewModal === true && (
        <>
          <ModalCard close={setcreateNewModal}>
            <div className="w-96  border bg-white shadow-2xl rounded-lg p-5 flex flex-col items-center relative">
              <div className="">
                <p className="text-center mb-2">Profile Picture</p>
                {!thumbnail ? (
                  <div className="w-44 aspect-square bg-[#e2e2e2] rounded-full flex flex-col items-center justify-center p-3 relative">
                    <input
                      type="file"
                      onChange={(event) => uploadImage(event)}
                      className="h-full w-full rounded-full absolute opacity-0"
                    />
                    <Plus size={32} color="black" />
                    <p className="text-xs text-center text-black mt-3">
                      Drag and drop or click here to upload image
                    </p>
                  </div>
                ) : (
                  <div className="w-44 aspect-square bg-[#e2e2e2] rounded-full flex flex-col items-center justify-center relative">
                    <input
                      type="file"
                      onChange={(event) => uploadImage(event)}
                      className="h-full w-full rounded-full absolute opacity-0"
                    />
                    <Image
                      alt="thumbnail"
                      src={thumbnail}
                      height={176}
                      width={176}
                      className="rounded-full"
                    />
                  </div>
                )}
              </div>
              <div className="w-full my-2">
                <p className="">
                  Contact Name <span className="text-red-500">*</span>
                </p>
                <input
                  ref={nameref}
                  type="text"
                  className="h-10 w-full border-2 px-3 rounded-md placeholder:text-[#121212] appearance-none outline-none hover:border-[#4611ea] focus:border-[#4611ea]"
                />
              </div>
              <div className="flex w-full gap-3 my-2">
                <div className="w-28">
                  <p className="">
                    Code <span className="text-red-500">*</span>
                  </p>
                  <input
                    ref={ccoderef}
                    type="text"
                    defaultValue="+91"
                    className="h-10 w-full border-2 px-3 rounded-md placeholder:text-[#121212] appearance-none outline-none hover:border-[#4611ea] focus:border-[#4611ea]"
                  />
                </div>
                <div className="w-full flex-1">
                  <p className="">
                    Phone Number <span className="text-red-500">*</span>
                  </p>
                  <input
                    ref={phoneref}
                    type="number"
                    className="h-10 w-full border-2 px-3 rounded-md placeholder:text-[#121212] appearance-none outline-none hover:border-[#4611ea] focus:border-[#4611ea]"
                  />
                </div>
              </div>
              <div className="mt-3 w-full">
                <button
                  className="h-12 w-full px-5 bg-[#121212]  text-white rounded-md gap-3 flex items-center justify-center "
                  onClick={() =>
                    addingLoading === false ? addContact() : null
                  }
                >
                  {addingLoading === true ? (
                    <CircleNotch size={28} color="white" />
                  ) : (
                    "Add New"
                  )}
                </button>
              </div>
            </div>
          </ModalCard>
        </>
      )}
      {editModal === true && (
        <>
          <ModalCard close={seteditModal}>
            <div className="w-96  border bg-white shadow-2xl rounded-lg p-5 flex flex-col items-center relative">
              <div className="">
                <p className="text-center mb-2">Profile Picture</p>
                {!activeEditCard?.photo ? (
                  <div className="w-44 aspect-square bg-[#e2e2e2] rounded-full flex flex-col items-center justify-center p-3 relative">
                    <input
                      type="file"
                      onChange={(event) => uploadImage(event, "update")}
                      className="h-full w-full rounded-full absolute opacity-0"
                    />
                    <Plus size={32} color="black" />
                    <p className="text-xs text-center text-black mt-3">
                      Drag and drop or click here to upload image
                    </p>
                  </div>
                ) : (
                  <div className="w-44 aspect-square bg-[#e2e2e2] rounded-full flex flex-col items-center justify-center relative">
                    <input
                      type="file"
                      onChange={(event) => uploadImage(event, "update")}
                      className="h-full w-full rounded-full absolute opacity-0"
                    />
                    <Image
                      alt="thumbnail"
                      src={activeEditCard?.photo}
                      height={176}
                      width={176}
                      className="rounded-full"
                    />
                  </div>
                )}
              </div>
              <div className="w-full my-2">
                <p className="">
                  Contact Name <span className="text-red-500">*</span>
                </p>
                <input
                  ref={nameref}
                  defaultValue={activeEditCard?.name}
                  type="text"
                  className="h-10 w-full border-2 px-3 rounded-md placeholder:text-[#121212] appearance-none outline-none hover:border-[#4611ea] focus:border-[#4611ea]"
                />
              </div>
              <div className="flex w-full gap-3 my-2">
                <div className="w-28">
                  <p className="">
                    Code <span className="text-red-500">*</span>
                  </p>
                  <input
                    ref={ccoderef}
                    defaultValue={activeEditCard?.countryCode ?? "+91"}
                    type="text"
                    className="h-10 w-full border-2 px-3 rounded-md placeholder:text-[#121212] appearance-none outline-none hover:border-[#4611ea] focus:border-[#4611ea]"
                  />
                </div>
                <div className="w-full flex-1">
                  <p className="">
                    Phone Number <span className="text-red-500">*</span>
                  </p>
                  <input
                    ref={phoneref}
                    defaultValue={activeEditCard?.phone}
                    type="number"
                    className="h-10 w-full border-2 px-3 rounded-md placeholder:text-[#121212] appearance-none outline-none hover:border-[#4611ea] focus:border-[#4611ea]"
                  />
                </div>
              </div>
              <div className="mt-3 w-full">
                <button
                  className="h-12 w-full px-5 bg-[#121212]  text-white rounded-md gap-3 flex items-center justify-center "
                  onClick={() =>
                    addingLoading === false ? updateContact() : null
                  }
                >
                  {addingLoading === true ? (
                    <CircleNotch size={28} color="white" />
                  ) : (
                    "Update Contact"
                  )}
                </button>
              </div>
            </div>
          </ModalCard>
        </>
      )}
      <div className="h-16 w-full border-b shadow-sm flex items-center justify-between px-10">
        <Image alt="logo" src="/logo.svg" height={60} width={240} />
        <div className="">
          <input
            type="text"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by person name"
            className="border rounded-lg h-10 w-72 px-3 max-w-[520px] placeholder:text-[#808080]"
          />
        </div>
        <div className="flex items-center gap-5">
          <Image
            alt="logo"
            src={
              authData?.photoURL === null
                ? `https://ui-avatars.com/api/?size=100&background=random&name=${authData?.displayName}`
                : authData?.photoURL
            }
            height={40}
            width={40}
            className="rounded-full"
          />
          <button className="" onClick={() => logout()}>
            <SignOut size={32} color="#121212" />
          </button>
        </div>
      </div>

      <div className="p-10">
        <div className="mb-4 flex justify-end">
          <button
            className="h-12 w-fit px-5 bg-[#121212] flex items-center justify-center text-white rounded-md gap-3 "
            onClick={() => setcreateNewModal(true)}
          >
            <Plus size={24} color="white" />
            Add New
          </button>
        </div>
        <div className="flex gap-5 flex-wrap  ">
          {userContacts
            ?.filter((contact) =>
              contact.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            ?.map((contact, index) => (
              <ContactCard
                key={index}
                details={contact}
                deleteContact={deleteContact}
                deleteLoading={deleteLoading}
                seteditModal={seteditModal}
                setactiveEditCard={setactiveEditCard}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
