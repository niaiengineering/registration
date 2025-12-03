import { useState, useEffect, useRef } from 'react';
import { Check, Download, Printer } from "lucide-react";
import * as htmlToImage from "html-to-image";
import QRCodeStyling from "qr-code-styling";
import QRLogo from '../assets/qrlogo.svg';

import styles from '../styles/RegisterModal.module.css';
import { toast } from "react-toastify";

export default function RegisterModal({ open, handleClose, formData }) {
  const TTL = 0.5;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(TTL * 60);
  const countdownRef = useRef(TTL * 60);
  const intervalRef = useRef(null);

  const [confirmOtp, setConfirmOtp] = useState(false);
  const cardRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState("Sample Data To Test QR Code.");

  const colors = ["#6C63FF", "#003B73", "#0077B6", "#5A189A", "#0A9396", "#9B2226"];
  const [avatarColor] = useState(colors[Math.floor(Math.random() * colors.length)]);

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

  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
    return (parts[0][0] + parts[1][0])?.toUpperCase();
  };

  const qrRef = useRef(null);

  // Generate QR code instance
  const qrCodeRef = useRef(
    new QRCodeStyling({
      width: 130,
      height: 130,
      type: "svg",
      data: qrDataUrl,
      image: QRLogo,
      dotsOptions: { color: "#000", type: "dots" },
      backgroundOptions: { color: "transparent" },
      cornersSquareOptions: { type: "extra-rounded" },
      cornersDotOptions: { type: "dot" },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 2,
        imageSize: 0.4,
      },
    })
  );

  useEffect(() => {
    if (confirmOtp && qrRef.current) {
      qrCodeRef.current.append(qrRef.current);
    }
  }, [confirmOtp]);

  const handleDownload = () => {
    if (!cardRef.current) return;
    htmlToImage.toPng(cardRef.current).then((dataUrl) => {
      const link = document.createElement("a");
      link.download = `${formData.fullName}_ID.png`;
      link.href = dataUrl;
      link.click();
    });
  };

  const handlePrint = () => {
    if (!cardRef.current) return;

    htmlToImage.toPng(cardRef.current).then((dataUrl) => {
      const printWindow = window.open("", "_blank");

      printWindow.document.write(`
      <html>
        <head>
          <title>ID Card</title>
        </head>
        <body style="margin:0; display:flex; justify-content:center; align-items:center;">
          <img src="${dataUrl}" style="width:100%;"/>
        </body>
      </html>
    `);

      printWindow.document.close();
      printWindow.focus();

      // Delay the printing to allow rendering inside new window
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500); // Increase if needed
    });
  };


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
      <div className={styles.modalOverlay}>
        <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3>ID Preview</h3>
          </div>

          <div className={styles.idCard} ref={cardRef}>
            <div className={styles.topRow}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  className={styles.idPhoto}
                />
              ) : (
                <div
                  className={styles.initialsCircle}
                  style={{ backgroundColor: avatarColor }}
                >
                  {getInitials(formData.fullName || "N A")}
                </div>
              )}

              <div className={styles.qrCodeBox}>
                <div className={styles.qrPlaceholder} ref={qrRef}></div>
              </div>
            </div>

            <h2 className={styles.name}>{formData.fullName}</h2>


            <div className={styles.detailsGrid}>
              <div>
                <p className={styles.idPlaceholder}>Reg No</p>
                <p className={styles.idValue}>123456 {formData.regNo}</p>
                <p className={styles.idPlaceholder}>Phone</p>
                <p className={styles.idValue}>{formData.phone}</p>
                <p className={styles.idPlaceholder}>Pincode</p>
                <p className={styles.idValue}>{formData.pincode}</p>
              </div>
              <div>
                <p className={styles.idPlaceholder}>Age</p>
                <p className={styles.idValue}>{formData.age}</p>
                <p className={styles.idPlaceholder}>Email</p>
                <p className={styles.idValue}>{formData.email}</p>
                <p className={styles.idPlaceholder}>City</p>
                <p className={styles.idValue}>{formData.city}</p>
              </div>
            </div>
          </div>
          <div className={styles.footer}>
            <button className={styles.confirmBtn} onClick={handleClose}>
              <Check size={20} />
            </button>
            <div className={styles.actionBtns}>
              <button className={styles.iconBtn} onClick={handleDownload}>
                <Download size={20} />
              </button>

              <button className={styles.iconBtn} onClick={handlePrint}>
                <Printer size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

    );
  }


}

