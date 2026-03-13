import React, { useEffect } from "react";
import axios from "axios"

const Orders = () => {
    const [orders, setOrders] = React.useState([]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get("https://stockflow-backend-tq0g.onrender.com/api/order", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                },
            });
            if (response.data.success) {
                setOrders(response.data.orders)
            } else {
                alert("Error fetching products");
            }
        } catch (error) {
            console.log("Error fetching orders:", error);
        }
    }
    useEffect(() => {
        fetchOrders()
    }, [])

    return (
        <div className='w-full h-full flex-col gap-4 p-4'>
            <h1 className='text-2xl font-bold' >Orders</h1>
            <div>
                <table className='w-full border-collapse border border-gray-300 mt-4'>
                    <thead>
                        <tr className='bg-gray-200'>
                            <th className='border border-gray-300 p-2'>S No</th>
                            <th className='border border-gray-300 p-2'>Product Name</th>
                            <th className='border border-gray-300 p-2'>Category Name</th>
                            <th className='border border-gray-300 p-2'>Quantity</th>
                            <th className='border border-gray-300 p-2'>Total Price</th>
                            <th className='border border-gray-300 p-2'>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders && orders.map((order, index) => (
                            <tr key={order._id}>
                                <td className='border border-gray-300 p-2'>{index + 1}</td>
                                <td className='border border-gray-300 p-2'>{order.product.name}</td>
                                <td className='border border-gray-300 p-2'>{order.product.categoryId.categoryName}</td>
                                <td className='border border-gray-300 p-2'>{order.quantity}</td>
                                <td className='border border-gray-300 p-2'>{order.totalPrice}</td>
                                <td className='border border-gray-300 p-2'>
                                    {new Date(order.orderDate).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && <div>No records</div>}
            </div>
        </div>
    )
}
export default Orders