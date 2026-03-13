import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {

    const [user, setUser] = React.useState({
        name: '',
        email: '',
        address: '',
        password: ''
    });
    const [edit, setEdit] = useState(false);
    const fetchUser = async () => {
        try {
            const response = await axios.get('https://stockflow-backend-tq0g.onrender.com/api/user/profile', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('pos-token')}`
                },
            });
            if (response.data.success) {
                setUser({
                    name: response.data.user.name,
                    email: response.data.user.email,
                    address: response.data.user.address,
                });
            }
        } catch (error) {
            console.log("error fetching user profile", error);
            alert("error fetching user profile");
        };
    };
    useEffect(() => {
        fetchUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put("https://stockflow-backend-tq0g.onrender.com/api/user/profile", user, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('pos-token')}`,
                },
            });
            if (response.data.success) {
                alert("profile updated successfully");
                setEdit(false)
            } else {
                alert("failed to update profile");
            }
        } catch (error) {
            console.log("error updating profile", error)
            alert("error updating profile")
        }
    }

    return (
        <div className="p-5">
            <form className="bg-white p-6 rounded-lg shadow max-w-md" onSubmit={handleSubmit}>
                <h2 className="font-bold text-2xl">User Profile</h2>

                <div className="mb-4 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text"
                        name="name"
                        value={user.name}
                        disabled={!edit}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email"
                        name="email"
                        value={user.email}
                        disabled={!edit}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input type="text"
                        name="address"
                        value={user.address}
                        disabled={!edit}
                        onChange={(e) => setUser({ ...user, address: e.target.value })}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {edit && (
                    <div className='mb-4'>
                        <label className='pblock text-sm font-medium text-gray-700 mb-1'>
                            Password
                        </label>
                        <input
                            type='password'
                            name='password'
                            placeholder='enter new password(optional)'
                            autoComplete='new-password'
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {!edit ? (
                    <button
                        type='button'
                        onClick={() => setEdit(!edit)}
                        className='bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 cursor-pointer'
                    >
                        Edit Profile
                    </button>
                ) : (
                    <>
                        <button type='submit'
                            className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 cursor-pointer'
                        >Save Changes</button>
                        <button
                            type='button'
                            onClick={() => setEdit(!edit)}
                            className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 ml-2 cursor-pointer'
                        >
                            Cancel
                        </button>
                    </>
                )}
            </form>
        </div >
    )
}

export default Profile