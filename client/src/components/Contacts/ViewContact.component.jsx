// src/pages/Contacts/ViewContact.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
// import { fetchContactById } from "../../redux/slices/contactSlice";
import { fetchContactById } from "../../redux/slices/contactSlice.js";

const ViewContact = () => {
  const { id } = useParams();
  // const dispatch = useDispatch();
  const contact = useSelector((state) => id ? fetchContactById(state, id) : {});
  console.log("contact :", contact);

  useEffect(() => {
    // dispatch(fetchContactById(id));
    // console.log("contact :", contact);
    // console.log("id :", id);
  // }, [dispatch, id]);
  }, []);

  return (
    <div className="p-3">
      <h4>👁️ View Contact</h4>
      <p><strong>Name:</strong> {contact.contactName}</p>
      <p><strong>Email:</strong> {contact.savedUser.email}</p>
      <Link to="/contacts" className="btn btn-secondary">Back</Link>
    </div>
  );
};

export default ViewContact;