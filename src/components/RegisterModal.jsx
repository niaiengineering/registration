import { useState, useEffect, useRef } from 'react';

import styles from '../styles/RegisterModal.module.css';
import { toast } from "react-toastify";

export default function RegisterModal({ open, handleClose, formData }) {
  const TTL = 0.5;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(TTL * 60); // State to trigger re-renders
  const countdownRef = useRef(TTL * 60);
  const intervalRef = useRef(null);

  const [confirmOtp, setConfirmOtp] = useState(false);

  // Timer count(TTL)
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (countdownRef.current > 0) {
        countdownRef.current -= 1;
        setCountdown(countdownRef.current); // Trigger UI update
      } else {
        clearInterval(intervalRef.current);
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  // Handling resend OTP
  const handleResendOTP = () => {
    clearInterval(intervalRef.current); // Clear old timer
    countdownRef.current = TTL * 60;
    setCountdown(TTL * 60);
    // Restart countdown
    intervalRef.current = setInterval(() => {
      if (countdownRef.current > 0) {
        countdownRef.current -= 1;
        setCountdown(countdownRef.current);
      } else {
        clearInterval(intervalRef.current);
      }
    }, 1000);
  };

  // Handle cursor to next input box
  const handleChange = (index, event) => {
    let value = event.target.value;
    if (!/^\d*$/.test(value)) return;

    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  // Handle Backspace to clear input box
  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      let newOtp = [...otp];
      if (!newOtp[index] && index > 0) {
        document.getElementById(`otp-input-${index - 1}`).focus();
      }
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const otpValue = otp.join("");

  const verifyOtp = async (otpValue) => {
    if (otpValue.length !== 6) {
      toast.error("please enter a valid 6-digit OTP.");
    }
    try {
      const dummyOtp = "123456";
      if (otpValue === dummyOtp) {
        toast.success("Verified Successfully");
        setConfirmOtp(true);
      }
      else {
        toast.error("Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        document.getElementById("otp-input-0").focus();
      }
    }
    catch (e) {
      console.error("Error verifying OTP:", e)
    }
  }

  if (!confirmOtp) {
    return (
      <div className={styles.container}>
        <div className={styles.popover}>
          <h4>OTP VERIFICATION</h4>
          <div className={styles.inputbox}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                inputMode="numeric"
                pattern="[0-9]"
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
            ))}
          </div>
          <p>
            Don't get the code?
            <button
              className={styles.resend}
              disabled={countdown > 0}
              onClick={handleResendOTP}
              style={{ color: countdown > 0 ? "#b98f4073" : "#B98E40" }}
            >
              Resend
            </button>
          </p>

          <p style={{ color: countdown > 10 ? "#B98E40" : "red" }}>
            Time remaining: {Math.floor(countdown / 60)}:
            {String(countdown % 60).padStart(2, "0")}
          </p>

          <button
            className={styles.verify}
            onClick={async () => {
              if (otp.some((digit) => digit === "")) {
                toast.error("Please enter a valid 6-digit OTP.");
                return;
              }
              await verifyOtp(otpValue);
            }}
            disabled={countdown === 0}
          >
            {countdown === 0 ? "Time Expired" : "Verify"}
          </button>
        </div>
      </div>
    )
  }


  else if (confirmOtp) {

    const imageUrl = formData.imageFile ? URL.createObjectURL(formData.imageFile) : null;

    return (
      <div className={styles.container}>
        <div className={styles.idCard}>
          <div className={styles.photoSection}>
            <img src={imageUrl} alt="Profile" className={styles.profileImage} />
            <p className={styles.regNo}>Reg No : 123456 {formData.regNo}</p>
          </div>

          <div className={styles.detailsSection}>
            <p className={styles.name}>Name : {formData.fullName}</p>
            <p>City : {formData.city}</p>
            <p>Pincode : {formData.pincode}</p>
            <p>Mobile : {formData.mobile}</p>
          </div>

          <button className={styles.confirmBtn} onClick={handleClose}>
            Confirm
          </button>
        </div>
      </div>
    );
  }


}

