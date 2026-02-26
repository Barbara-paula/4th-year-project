import React, { useState } from 'react'
import {useAuth} from "../context/AuthContext"
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

const Login = () => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const {login} = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        

        try {

            const response = await axios.post("http://localhost:3000/api/auth/login",{
                email, password,});
            console.log(response.data)

            if (response.data.success){
                login(response.data.user, response.data.token);
                if(response.data.user.role === "admin"){
                    navigate("/admin/dashboard");
                }else {
                    navigate("/customer/dashboard");
                }
            } else {
                setError(response.data.message || 'Login failed');
            }

        }catch (error) {
            console.error('Login error:', error);
            if(error.response) {
                setError(error.response.data.message || 'Login failed');
            } else if(error.request) {
                setError('Network error. Please check if the server is running.');
            } else {
                setError('An error occurred. Please try again.');
            }
        }finally {
            setLoading(false)
        }
    }

    return (
        <div
        className='flex flex-col items-center justify-center h-screen bg-gradient-to-b from-green-600 from-50% to-gray-100 to-50% space-y-6'
        >
            <h2 className='text-3xl text-white'>Inventory Management System</h2>
            <div className='border shadow-lg p-6 w-80 bg-white'>
                <h2 className='text-2l font-bold mb-4'>Login</h2>
                {error && (
                    <div className='bg-red-200 text-red-700 p-2 mb-4 rounded'>
                        {error}
                        </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className='mb-4'>
                        <label className='block text-gray-700'>Email</label>
                        <input
                            type='email'
                            className='w-full px-3 py-2 border'
                            name='email'
                            value={email}
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='Enter Email'
                        />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700'>Password</label>
                        <input
                        type='password'
                        className='w-full px-3 py-2 border'
                        name='password'
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='enter password'
                        />
                    </div>
                    <div className='mb-4'>
                        <button
                        type='submit'
                        className='w-full bg-green-600 text-white py-2'
                        >
                            {loading ? "loading...": "Login"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;