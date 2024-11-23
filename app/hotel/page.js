"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const CreateHotelForm = () => {
  const [formData, setFormData] = useState({
    hotelName: "",
    address: "",
    email: "",
    contactNo: "",
    gstNo: "",
    sacNo: "",
    fssaiNo: "",
    hotelLogo: null,
    qrCode: null,
    vatNo: "",
  });

  const [hotels, setHotels] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // New state for success modal
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); // State for error modal
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExisted, setIsExisted] = useState(false);
  const [deleteHotelId, setDeleteHotelId] = useState(null);

  // Fetch hotels on component mount
  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await axios.get(
        "https://172.188.99.139:5001/api/hotel/get-all"
      );
      setHotels(response.data);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  };

  const router = useRouter();

  useEffect(() => {
    const authToken = localStorage.getItem("EmployeeAuthToken");
    if (!authToken) {
      router.push("/login");
    }
  }, []);

  const [editFormData, setEditFormData] = useState({
    hotelName: "",
    address: "",
    email: "",
    contactNo: "",
    gstNo: "",
    sacNo: "",
    fssaiNo: "",
    hotelLogo: null,
    qrCode: null,
    vatNo: "",
  });

  // State to manage whether the edit modal is open or not
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Function to open the edit modal and fetch hotel details
  const handleEdit = async (hotelId) => {
    try {
      const response = await axios.get(
        `https://172.188.99.139:5001/api/hotel/get/${hotelId}`
      );
      const hotelDetails = response.data;

      setEditFormData(hotelDetails);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error fetching hotel details for edit:", error);
    }
  };

  // Function to handle changes in the edit form
  const handleEditInputChange = (e) => {
    const { name, value, type, files } = e.target;

    // Capitalize the first letter if the input is not empty
    const capitalizedValue = value !== "" ? capitalizeFirstLetter(value) : "";

    let validatedValue;

    // Validation for name and address
    if (name === "hotelName" || name === "address") {
      // Capitalize the first letter if the input is not empty
      validatedValue =
        value.trim() !== "" ? capitalizeFirstLetter(value) : value;
    } else {
      validatedValue = value;
    }

    // Validation for contact number (mobile number)
    if (name === "contactNo") {
      // Allow typing only if the input value is empty or contains digits and does not exceed 10 characters
      if (value === "" || /^\d{0,10}$/.test(value)) {
        validatedValue = value; // Set the validated value
      } else {
        console.error(
          "Invalid input: Contact number must be a 10-digit number."
        );
        return;
      }
    }

    setEditFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? files[0] : capitalizedValue, // Ensure the first letter is capitalized for file inputs as well
    }));
  };

  // Function to handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Validate contact number
    if (editFormData.contactNo.length !== 10) {
      setIsErrorModalOpen(true); // Open error modal
      // Close error modal after 2 seconds
      setTimeout(() => {
        setIsErrorModalOpen(false);
      }, 2000);
      return;
    }

    try {
      const formDataForUpload = new FormData();
      Object.entries(editFormData).forEach(([key, value]) => {
        formDataForUpload.append(key, value);
      });

      const response = await axios.patch(
        `https://172.188.99.139:5001/api/hotel/edit/${editFormData._id}`,
        formDataForUpload
      );
      console.log("Hotel edited successfully:", response.data);

      setIsEditModalOpen(false); // Close the edit modal
      fetchHotels(); // Refresh the list after editing
    } catch (error) {
      console.error("Error editing hotel:", error);
    }
  };

  // const handleDelete = async (hotelId) => {
  //   try {
  //     await axios.delete(`https://172.188.99.139:5001/api/hotel/delete/${hotelId}`);
  //     console.log('Hotel deleted successfully.');
  //     fetchHotels(); // Refresh the list after deletion
  //   } catch (error) {
  //     console.error('Error deleting hotel:', error);
  //   }
  // };

  const resetFormSubmission = () => {
    setIsFormSubmitted(false);
  };

  const handleDelete = (hotelId) => {
    setDeleteHotelId(hotelId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `https://172.188.99.139:5001/api/hotel/delete/${deleteHotelId}`
      );
      console.log("Hotel deleted successfully.");
      fetchHotels(); // Refresh the list after deletion
      resetFormSubmission(); // Reset form submission state
      setIsDeleteModalOpen(false); // Close the delete modal
    } catch (error) {
      console.error("Error deleting hotel:", error);
    }
  };
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let validatedValue = value;

    // Validation for name and address
    if (name === "hotelName" || name === "address") {
      // Capitalize the first letter if the input is not empty
      validatedValue =
        value.trim() !== "" ? capitalizeFirstLetter(value) : value;
    }

    // Validation for contact number (mobile number)
    if (name === "contactNo") {
      // Allow typing only if the input value is empty or contains digits and does not exceed 10 characters
      if (value === "" || /^\d{0,10}$/.test(value)) {
        validatedValue = value; // Set the validated value
      } else {
        console.error(
          "Invalid input: Contact number must be a 10-digit number."
        );
        return;
      }
    }

    // Validation for hotelName (alphabets only)
    // if (name === 'hotelName') {
    //   if (value === '' || /^[A-Za-z\s]+$/.test(value)) {
    //     validatedValue = value; // Set the validated value
    //   } else {
    //     console.error("Invalid input: Hotel name must contain only alphabets.");
    //     return;
    //   }
    // }

    setFormData((prevData) => ({
      ...prevData,
      [name]: validatedValue,
    }));
  };

  const resetForm = () => {
    setFormData({
      hotelName: "",
      address: "",
      email: "",
      contactNo: "",
      gstNo: "",
      sacNo: "",
      fssaiNo: "",
      hotelLogo: null,
      qrCode: null,
      vatNo: "",
    });
  };

  // Function to handle successful hotel creation
  const handleSuccessModal = () => {
    setIsSuccessModalOpen(true);
    setTimeout(() => {
      setIsSuccessModalOpen(false);
    }, 2000); // Auto-close success modal after 3 seconds (adjust as needed)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.contactNo.length !== 10) {
      setIsErrorModalOpen(true); // Open error modal
      // Close error modal after 2 seconds
      setTimeout(() => {
        setIsErrorModalOpen(false);
      }, 2000);
      return;
    }

    if (hotels.length >= 1) {
      setIsExisted(true);

      setTimeout(() => {
        setIsExisted(false);
      }, 2000);
      return;
    }

    try {
      const formDataForUpload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataForUpload.append(key, value);
      });

      const response = await axios.post(
        "https://172.188.99.139:5001/api/hotel/create",
        formDataForUpload
      );
      console.log("Hotel created successfully:", response.data);

      resetForm(); // Clear form data
      fetchHotels(); // Refresh the list after successful submission
      handleSuccessModal(); // Display success modal

      // Disable form submission after successful creation
      setIsFormSubmitted(true);
    } catch (error) {
      console.error("Error creating hotel:", error);
    }
  };

  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("EmployeeAuthToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    }
  }, []);

  return (
    <>
      <Sidebar />
      <div className="flex lg:mt-16  justify-center w-full h-full flex-col lg:ml-0 lg:flex-row md:ml-10 ml-5">
        <div className="max-w-2xl  bg-[#ffffff] p-8 rounded shadow-md font-sans mt-20 flex-col">
          {isSuccessModalOpen && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-md shadow-md">
                <h2 className="text-base font-semibold mb-4 text-green-600">
                  Hotel Created Successfully!
                </h2>
                {/* You can customize the success message here */}
              </div>
            </div>
          )}
          {isExisted && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-md shadow-md">
                <h2 className="text-base font-semibold mb-4 text-red-600">
                  Hotel is Already Submitted.......
                </h2>
              </div>
            </div>
          )}
          {isDeleteModalOpen && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              <div
                className="modal-container bg-white w-full md:w-96 p-6 m-4 rounded shadow-lg text-sm md:text-base"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="mb-4 font-semibold text-red-600">
                  Are you sure you want to delete this hotel?
                </p>
                <div className="flex justify-around mt-4">
                  <button
                    type="button"
                    className="bg-red-200 hover:bg-red-300 text-red-700 font-bold py-2 px-4 rounded-full"
                    onClick={handleDeleteConfirm}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className="bg-slate-300 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-full"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
          {isErrorModalOpen && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-md shadow-md">
                <h2 className="text-base font-semibold mb-4 text-red-600">
                  Contact number must be exactly 10 digits long.
                </h2>
              </div>
            </div>
          )}
          <h2
            className="text-2xl font-semibold mb-4  "
            style={{ color: process.env.NEXT_PUBLIC_THIRD_COLOR }}
          >
            Create Hotel
          </h2>
          {/* Hotel Name */}
          <div className="flex flex-wrap flex-col">
            <div className="w-full  mb-4">
              <label className="block text-sm font-medium text-gray-600">
                Hotel Name
                <span className="text-red-500">*</span>
              </label>
              <input
                id="hotelNameInput"
                type="text"
                name="hotelName"
                value={formData.hotelName}
                onChange={handleInputChange}
                className="w-full p-1 border rounded-md"
              />
            </div>

            <div className="w-full  mb-4">
              <label className="block text-sm font-medium text-gray-600">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-1 border rounded-md"
              />
            </div>

            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-gray-600">
                Address
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-1 border rounded-md"
              />
            </div>

            <div className="flex justify-center gap-5 w-full mb-4 ">
              <div className="w-full  mb-2 sm:mb-0">
                <label className="block text-sm font-medium text-gray-600">
                  Contact No.
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  className="w-full p-1 border rounded-md"
                />
              </div>

              <div className="w-full mb-2 sm:mb-0">
                <label className="block text-sm font-medium text-gray-600">
                  GST No.
                </label>
                <input
                  type="text"
                  name="gstNo"
                  value={formData.gstNo}
                  onChange={handleInputChange}
                  className="w-full p-1 border rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-center gap-5 w-full mb-4 ">
              <div className="w-full  mb-2 sm:mb-0">
                <label className="block text-sm font-medium text-gray-600">
                  SAC No.
                </label>
                <input
                  type="text"
                  name="sacNo"
                  value={formData.sacNo}
                  onChange={handleInputChange}
                  className="w-full p-1 border rounded-md"
                />
              </div>

              <div className="w-full  mb-2 sm:mb-0 ">
                <label className="block text-sm font-medium text-gray-600">
                  FSSAI No.
                </label>
                <input
                  type="text"
                  name="fssaiNo"
                  value={formData.fssaiNo}
                  onChange={handleInputChange}
                  className="w-full p-1 border rounded-md"
                />
              </div>
            </div>

            <div className="flex mb-4">
              <div className="w-full sm:w-1/2 mb-2 sm:mb-0 mr-4">
                <label className="block text-sm font-medium text-gray-600">
                  Hotel Logo
                </label>
                <input
                  type="file"
                  name="hotelLogo"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="w-full sm:w-1/2 ">
                <label className="block text-sm font-medium text-gray-600">
                  QR Code
                </label>
                <input
                  type="file"
                  name="qrCode"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-center w-full mb-4">
              <button
                style={{
                  color: process.env.NEXT_PUBLIC_FOURTH_COLOR,
                  backgroundColor: process.env.NEXT_PUBLIC_FIRST_COLOR,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor =
                    process.env.NEXT_PUBLIC_THIRD_COLOR; // Hover color
                  e.target.style.color = process.env.NEXT_PUBLIC_FIRST_COLOR; // Hover color
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor =
                    process.env.NEXT_PUBLIC_FIRST_COLOR; // Original color
                  e.target.style.color = process.env.NEXT_PUBLIC_THIRD_COLOR; // Original color
                }}
                type="submit"
                className="text-gray font-semibold p-2 px-4 rounded-full w-full lg:w-72 transition duration-300 ease-in-out"
                onClick={handleSubmit}
                disabled={isFormSubmitted} // Disable the button if form is submitted
              >
                Create Hotel
              </button>
            </div>
          </div>
        </div>

        <div className="  bg-[#ffffff]  lg:text-xl md:textbase text-md  rounded  font-sans lg:mt-52 lg:ml-20 ml-5">
          <div className=" custom-scrollbars overflow-y-auto">
            {hotels.map((hotel) => (
              <div
                key={hotel._id}
                className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-4 mb-2 rounded-md"
              >
                <div className="flex flex-col space-y-1">
                  <p className="text-gray-700">
                    <strong>Hotel Name:</strong> {hotel.hotelName}
                  </p>
                  <p className="text-gray-700">
                    <strong>Address:</strong> {hotel.address}
                  </p>
                  <p className="text-gray-700">
                    <strong>Email:</strong> {hotel.email}
                  </p>
                  <p className="text-gray-700">
                    <strong>Contact No.:</strong> {hotel.contactNo}
                  </p>
                  <p className="text-gray-700">
                    <strong>GST No.:</strong> {hotel.gstNo}
                  </p>
                  {userRole === "adminBar" && (
                    <p className="text-gray-700">
                      <strong>VAT No.:</strong> {hotel.vatNo}
                    </p>
                  )}
                  <p className="text-gray-700">
                    <strong>SAC No.:</strong> {hotel.sacNo}
                  </p>
                  <p className="text-gray-700">
                    <strong>FSSAI No.:</strong> {hotel.fssaiNo}
                  </p>
                  {hotel.hotelLogo && (
                    <div>
                      <strong>Logo:</strong>
                      <img
                        src={`http://ec2-16-171-154-162.eu-north-1.compute.amazonaws.com:5000/${hotel.hotelLogo}`}
                        alt="Hotel Logo"
                        className="w-10 h-10 mt-2"
                      />
                    </div>
                  )}

                  <div className="flex space-x-4 ">
                    <button
                      className="text-gray-600 focus:outline-none font-sans font-medium p-2 rounded-full shadow-md"
                      style={{ background: "#ffff" }}
                      onClick={() => handleEdit(hotel._id)}
                    >
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        color="orange"
                        className="cursor-pointer"
                      />
                    </button>
                    <button
                      className="text-gray-600 focus:outline-none font-sans font-medium p-2 rounded-full shadow-md"
                      style={{ background: "#ffff" }}
                      onClick={() => handleDelete(hotel._id)}
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        color="red"
                        className="cursor-pointer"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="font-sans fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:w-full center bg-black bg-opacity-50 flex justify-center items-center h-full">
          <div className="bg-white p-6 rounded-md shadow-md max-w-3xl mx-auto">
            <div className="relative">
              <button
                style={{
                  color: process.env.NEXT_PUBLIC_FOURTH_COLOR,
                  backgroundColor: process.env.NEXT_PUBLIC_FIRST_COLOR,
                }}
       
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor =
                    process.env.NEXT_PUBLIC_THIRD_COLOR; // Hover color
                  e.target.style.color =
                    process.env.NEXT_PUBLIC_FIRST_COLOR; // Hover color
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor =
                    process.env.NEXT_PUBLIC_FIRST_COLOR; // Original color
                  e.target.style.color =
                    process.env.NEXT_PUBLIC_THIRD_COLOR; // Original color
                }}
                onClick={() => setIsEditModalOpen(false)}
                className="absolute right-3  p-2 py-1 rounded-full text-center"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>
            <h2 className="text-base font-semibold">Edit Hotel</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="flex flex-wrap">
                <div className="w-full  mb-4">
                  <label className="block text-sm font-medium text-gray-600">
                    Hotel Name
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="hotelNameInput"
                    type="text"
                    name="hotelName"
                    value={editFormData.hotelName}
                    onChange={handleEditInputChange}
                    className="w-full p-1 border rounded-md"
                  />
                </div>

                <div className="w-full  mb-4">
                  <label className="block text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className="w-full p-1 border rounded-md"
                  />
                </div>

                <div className="w-full mb-4">
                  <label className="block text-sm font-medium text-gray-600">
                    Address
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditInputChange}
                    className="w-full p-1 border rounded-md"
                  />
                </div>

                <div className="flex justify-center gap-5 w-full mb-4 ">
                  <div className="w-full  mb-2 sm:mb-0">
                    <label className="block text-sm font-medium text-gray-600">
                      Contact No.
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactNo"
                      value={editFormData.contactNo}
                      onChange={handleEditInputChange}
                      className="w-full p-1 border rounded-md"
                    />
                  </div>

                  <div className="w-full mb-2 sm:mb-0">
                    <label className="block text-sm font-medium text-gray-600">
                      GST No.
                    </label>
                    <input
                      type="text"
                      name="gstNo"
                      value={editFormData.gstNo}
                      onChange={handleEditInputChange}
                      className="w-full p-1 border rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-center gap-5 w-full mb-4 ">
                  <div className="w-full  mb-2 sm:mb-0">
                    <label className="block text-sm font-medium text-gray-600">
                      SAC No.
                    </label>
                    <input
                      type="text"
                      name="sacNo"
                      value={editFormData.sacNo}
                      onChange={handleEditInputChange}
                      className="w-full p-1 border rounded-md"
                    />
                  </div>

                  <div className="w-full  mb-2 sm:mb-0 ">
                    <label className="block text-sm font-medium text-gray-600">
                      FSSAI No.
                    </label>
                    <input
                      type="text"
                      name="fssaiNo"
                      value={editFormData.fssaiNo}
                      onChange={handleEditInputChange}
                      className="w-full p-1 border rounded-md"
                    />
                  </div>
                </div>

                <div className="flex mb-4">
                  <div className="w-full sm:w-1/2 mb-2 sm:mb-0 mr-4">
                    <label className="block text-sm font-medium text-gray-600">
                      Hotel Logo
                    </label>
                    <input
                      type="file"
                      name="hotelLogo"
                      accept="image/*"
                      onChange={handleEditInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <div className="w-full sm:w-1/2 ">
                    <label className="block text-sm font-medium text-gray-600">
                      QR Code
                    </label>
                    <input
                      type="file"
                      name="qrCode"
                      accept="image/*"
                      onChange={handleEditInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-center w-full mb-4">
                  <button
                    style={{
                      color: process.env.NEXT_PUBLIC_FOURTH_COLOR,
                      backgroundColor: process.env.NEXT_PUBLIC_FIRST_COLOR,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor =
                        process.env.NEXT_PUBLIC_THIRD_COLOR; // Hover color
                      e.target.style.color =
                        process.env.NEXT_PUBLIC_FIRST_COLOR; // Hover color
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor =
                        process.env.NEXT_PUBLIC_FIRST_COLOR; // Original color
                      e.target.style.color =
                        process.env.NEXT_PUBLIC_THIRD_COLOR; // Original color
                    }}
                    type="submit"
                    className="text-gray font-semibold p-2 px-4 rounded-full w-full lg:w-72 transition duration-300 ease-in-out"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateHotelForm;
