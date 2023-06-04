import { CircleNotch, Pencil, Trash } from '@phosphor-icons/react';
import Image from 'next/image'
import React, { useState } from 'react'

export default function ContactCard({ details, deleteContact, deleteLoading, seteditModal, setactiveEditCard }) {
    const [deleteModalActive, setdeleteModalActive] = useState(false);

    return (
        <div className='w-72 aspect-square border bg-white shadow-2xl rounded-lg p-5 flex flex-col relative'>
            <div className="absolute right-0">
                <div className='relative'>
                    <div className='absolute right-3 group'>
                        <button className="h-10 w-10 hover:bg-[#fdfdfd] flex items-center justify-center rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#121212" viewBox="0 0 256 256">
                                <path d="M112,60a16,16,0,1,1,16,16A16,16,0,0,1,112,60Zm16,52a16,16,0,1,0,16,16A16,16,0,0,0,128,112Zm0,68a16,16,0,1,0,16,16A16,16,0,0,0,128,180Z"></path>
                            </svg>
                        </button>
                        <div className="group-hover:block hidden absolute top-10 right-0  w-48 bg-[#f2f2f2] rounded-lg border shadow-lg z-20">
                            <button onClick={() => { setactiveEditCard(details); seteditModal(true) }} className='h-10 w-full border-b hover:bg-white first:rounded-t-lg last:rounded-b-lg flex items-center justify-center gap-3'> <div className="w-10"><Pencil size={22} color='#121212' /></div> <p className="text-left">Edit </p></button>
                            <button onClick={() => deleteContact(details?._id)} className='h-10 w-full border-b hover:bg-white first:rounded-t-lg last:rounded-b-lg flex items-center justify-center gap-3'>{deleteLoading ? <CircleNotch size={22} color='black' /> : <><div className="w-10"><Trash size={22} color='red' /></div> <p className="text-left">Delete</p></>} </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full flex items-center justify-center">
                <Image alt='image' src={details?.photo === null ? "/defaultdp.png" : details?.photo} className='rounded-full' width={150} height={150} />
            </div>
            <div className="w-full mt-5">
                <p className="text-center text-3xl">{details?.name}</p>
            </div>
            <div className="h-full flex-1 flex flex-col justify-end">
                <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#121212" viewBox="0 0 256 256" className='absolute left-0'>
                        <path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z"></path>
                    </svg>
                    <p className="text-center">{details?.countryCode + details?.phone}</p>
                </div>
            </div>
        </div>
    )
}
