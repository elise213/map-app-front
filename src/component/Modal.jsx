import React, { useState, useContext, useRef, useEffect } from "react";
import { Context } from "../store/appContext";
import { Link } from "react-router-dom";
import { ModalInfo } from "./ModalInfo";
import styles from "../styles/resourceModal.css";
import Swal from "sweetalert2";
import { Tooltip, Icon } from "@mui/material";
import Rating from "@mui/material/Rating";

const Modal = ({ setShowRating, showRating }) => {
  const { store, actions } = useContext(Context);

  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [hover, setHover] = useState(-1);

  const isLoggedIn = !!store.token;
  const userIdFromSession = sessionStorage.getItem("user_id");
  const isAuthorizedUser = store.authorizedUser;
  const resource = store.selectedResource || {};

  const labels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Exceptional",
  };

  useEffect(() => {
    if (!showRating) setHover(-1);
  }, [showRating]);

  const handleSubmitReview = () => {
    if (!rating || !comment.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "You must include a rating and a comment.",
      });
      return;
    }

    actions
      .submitRatingAndComment(resource.id, comment, rating)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Thank you! Your comment is pending approval.",
        });
        setRating(0);
        setComment("");
        setShowRating(false);
        if (resource?.id) {
          actions.getAverageRating(
            resource.id,
            setAverageRating,
            setRatingCount
          );
          actions.getComments(resource.id, setComments);
        }
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to submit your review.",
        });
      });
  };

  const Marker = React.memo(({ result }) => {
    const [isHovered, setIsHovered] = useState(false);
    const openGoogleMaps = () => {
      if (result) {
        const { latitude, longitude } = result;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        window.open(url, "_blank");
      }
    };

    return (
      <div
        className="marker"
        onClick={openGoogleMaps}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="marker-icon">
          <i className="fa-solid fa-map-pin" style={{ color: "red" }}></i>
        </div>
        {isHovered && result && (
          <div className="marker-address">
            {result.address || "Address not available"}
          </div>
        )}
      </div>
    );
  });

  function toggleRatingModal() {
    setShowRating(!showRating);
  }

  useEffect(() => {
    if (store.selectedResource?.id) {
      actions.getAverageRating(
        store.selectedResource.id,
        setAverageRating,
        setRatingCount
      );
      actions.getComments(store.selectedResource.id, setComments);
    }
  }, [store.selectedResource]);

  useEffect(() => {
    console.log("resource", resource);
  }, []);

  return (
    <>
      {resource.alert && (
        <div className="alert-bar">
          {/* <marquee behavior="scroll" direction="left"> */}
          {/* 🚨 */}
          <div className="alert-text-div">
            <span className="modal-info-title">
              {resource.name} would like you to have the following information:{" "}
              {resource.alert}
            </span>
            {/* </marquee> */}
          </div>
        </div>
      )}

      <div className="resource-info">
        <ModalInfo
          schedule={resource.schedule}
          res={resource}
          setShowRating={setShowRating}
          setComments={setComments}
          averageRating={averageRating}
          setAverageRating={setAverageRating}
          toggleRatingModal={toggleRatingModal}
          ratingCount={ratingCount}
          setRatingCount={setRatingCount}
          isLoggedIn={isLoggedIn}
          comments={comments}
          userIdFromSession={userIdFromSession}
        />
      </div>

      {isAuthorizedUser && isLoggedIn && (
        <div className="modal-footer">
          <Tooltip title="Edit this information" arrow>
            <Link to={`/edit/${resource.id}`}>
              <Icon>handyman</Icon>
            </Link>
          </Tooltip>
        </div>
      )}

      {/* Rating Modal */}
      {showRating && (
        <>
          {" "}
          <div className="rate">
            <span className="close-modal" onClick={() => setShowRating(false)}>
              <span className="material-symbols-outlined">arrow_back_ios</span>
              Back
            </span>

            {!isLoggedIn && (
              <div className="please-log">
                Please
                <span
                  role="button"
                  tabIndex={0}
                  className="log-in"
                  onClick={() => {
                    actions.openLoginModal();
                    setShowRating(false);
                    actions.closeModal();
                  }}
                >
                  log in
                </span>
                to rate and review resources.
              </div>
            )}
            {isLoggedIn && (
              <>
                <div className="rating-container">
                  <div className="rating-label">
                    {rating !== null && labels[hover !== -1 ? hover : rating]}
                  </div>
                  <Rating
                    className="resource-rating"
                    name="resource-rating"
                    value={rating}
                    precision={1}
                    onChange={(event, newRating) => setRating(newRating)}
                    onChangeActive={(event, newHover) => {
                      setHover(newHover);
                    }}
                    style={{ fontSize: "25px" }}
                  />

                  <div className="comment-section">
                    <textarea
                      className="comment-text-area"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={`Describe your experience at ${resource.name}...`}
                      maxLength="280"
                    ></textarea>

                    <button
                      className="apply-button"
                      onClick={handleSubmitReview}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Modal;
