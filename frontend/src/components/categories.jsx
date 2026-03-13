import React, { useState, useEffect } from "react";
import axios from "axios";

const Categories = () => {
    const [categoryName, setCategoryName] = useState("")
    const [categoryDescription, setCategoryDescription] = useState("");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editCategory, setEditCategory] = useState(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://stockflow-backend-tq0g.onrender.com/api/category", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                },
            });
            console.log(response.data.categories);
            setCategories(response.data.categories);
            setLoading(false);
        } catch (error) {
            console.log("Error fetching categories:", error);
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editCategory) {
            const response = await axios.put(
                `https://stockflow-backend-tq0g.onrender.com/api/category/${editCategory}`,
                { categoryName, categoryDescription },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                    },
                }
            );
            if (response.data.success) {
                setEditCategory(null);
                setCategoryName("");
                setCategoryDescription("");
                alert("Category updated successfully");
                fetchCategories();
            } else {
                console.log("Error editing category:", data);
                alert("Error editing category. Please try again")
            }
        } else {
            const response = await axios.post(
                "https://stockflow-backend-tq0g.onrender.com/api/category/add",
                { categoryName, categoryDescription },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                    },
                }
            );
            if (response.data.success) {
                setCategoryName("");
                setCategoryDescription("");
                alert("Category added successfully");
                fetchCategories();
            } else {
                console.log("Error adding category:", response.data);
                alert("Error adding category. Please try again")
            }
        }
    }

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this category?");
        if (confirmDelete) {
            try {
                const response = await axios.delete(
                    `https://stockflow-backend-tq0g.onrender.com/api/category/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                        },
                    }
                );
                if (response.data.success) {
                    alert("Category deleted successfully");
                    fetchCategories();
                } else {
                    console.log("Error deleting category:", data);
                    alert("Error deleting category. Please try again")
                }
            } catch (error) {
                if (error.response) {
                    alert(error.response.data.message);
                } else {
                    alert("Error deleting category. Please try again")
                }
            }
        }
    };

    const handleEdit = async (category) => {
            setEditCategory(category._id);
            setCategoryName(category.categoryName);
            setCategoryDescription(category.categoryDescription);
        };

        const handleCancel = () => {
            setEditCategory(null);
            setCategoryName("");
            setCategoryDescription("");
        };

        if (loading) return <div>Loading...</div>;
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-8">Category Management</h1>

                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="lg:w-1/3">
                        <div className="bg-white shadow-md rounded:lg p-4">
                            <h2 className="text-center text-xl font-bold mb-4">{editCategory ? "Edit Category" : "Add Category"}</h2>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <input type="text"
                                        placeholder="Category Name"
                                        value={categoryName}
                                        className="border w-full p-2 rounded-md"
                                        onChange={(e) => setCategoryName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <input type="text"
                                        placeholder="Category Description"
                                        className="border w-full p-2 rounded-md"
                                        value={categoryDescription}
                                        onChange={(e) => setCategoryDescription(e.target.value)}
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button type="Submit"
                                        className="w-full mt-2 rounded-md bg-green-500 text-white p-3 cursor-pointer hover:bg-green-600"
                                    >{editCategory ? "Save Changes" : "Add Category"}</button>
                                    {editCategory && (
                                        <button type="button"
                                            className="w-full mt-2 rounded-md bg-red-500 text-white p-3 cursor-pointer hover:bg-red-600"
                                            onClick={handleCancel}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="lg:w-2/3">
                        <div className="bg-white shadow-md rounded-lg p-4">
                            <table className="w-full border-collapse border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-200 p-2">S No.</th>
                                        <th className="border border-gray-200 p-2">Category Name</th>
                                        <th className="border border-gray-200 p-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category, index) => (
                                        <tr key={index}>
                                            <td className="border border-gray-200 p -2">{index + 1}</td>
                                            <td className="border border-gray-200 p-2">{category.categoryName}</td>
                                            <td className="border border-gray-200 p-2">
                                                <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mr-2"
                                                    onClick={() => handleEdit(category)}>Edit</button>
                                                <button className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                                                    onClick={() => handleDelete(category._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
};
export default Categories;