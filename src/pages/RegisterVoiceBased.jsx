import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { toast } from "react-toastify";

import { TextField } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

import useSpeechRecognition from '../hooks/useSpeechRecognition'

import Navbar from '../components/Navbar'
import RegisterModal from '../components/RegisterModal';
import styles from '../styles/RegisterVoiceBased.module.css';

const RegisterVoiceBased = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        parentName: '',
        age: '',
        street: '',
        city: '',
        pincode: '',
        mobile: '',
        email: '',
        imageFile: null
    })

    const [errors, setErrors] = useState({});
    const [activeField, setActiveField] = useState(null);
    const { transcript, listening, startListening, stopListening, resetTranscript } =
        useSpeechRecognition({ lang: "ta-IN", continuous: false });

    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [voiceOpt, setVoiceOpt] = useState('');

    const [modalOpen, setModalOpen] = useState(false);

    const handleClose = () => {
        setModalOpen(false);
        // navigate('/login', { replace: true });
    };

    const handleOpen = () => {
        setModalOpen(true);
    }

    // Update field when transcript changes
    useEffect(() => {
        if (transcript && activeField) {
            setFormData((prev) => ({
                ...prev,
                [activeField]: transcript,
            }));
            stopListening();
            setActiveField(null);
        }
    }, [transcript, activeField, stopListening]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleStartMic = (fieldName) => {
        resetTranscript();
        setActiveField(fieldName);
        startListening();
    };

    const handleStopMic = () => {
        stopListening();
    }

    const handleOptChange = (e) => {
        setVoiceOpt(e.target.value);
    };

    function base64ToBlob(base64, contentType = 'image/jpeg') {
        const byteCharacters = atob(base64.split(',')[1]); // Remove `data:image/jpeg;base64,` part
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: contentType });
    }

    const capture = async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);

        // Convert base64 string to Blob
        const imageBlob = base64ToBlob(imageSrc);

        // If you want to create a File object (optional)
        const imageFile = new File([imageBlob], 'captured_photo.jpg', { type: 'image/jpeg' });

        setFormData((prev) => ({
            ...prev,
            imageFile: imageFile
        }))
        // setFormData.imageFile(imageFile);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Name: at least 3 characters
        if (formData.fullName.trim().length < 3) {
            newErrors.fullName = "Full Name must be at least 3 characters";
        }

        if (formData.parentName.trim().length < 3) {
            newErrors.parentName = "Parent Name must be at least 3 characters";
        }

        const ageRegex = /^[0-9]{1,3}$/;
        if (!ageRegex.test(formData.age)) {
            newErrors.age = "age number must be exactly 10 digits";
        }

        if (!formData.street) {
            newErrors.street = "Street is required";
        }

        if (!formData.city) {
            newErrors.city = "City is required";
        }

        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!pincodeRegex.test(formData.pincode)) {
            newErrors.pincode = "Pincode must be exactly 6 digits";
        }

        // Mobile: 10 digits only
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(formData.mobile)) {
            newErrors.mobile = "Mobile number must be exactly 10 digits";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Enter a valid email";
        }

        if (!voiceOpt) {
            newErrors.voiceOpt = "Please select an option";
        } else if (['yes', 'no'].includes(voiceOpt.toLowerCase())) {
            if (voiceOpt.toLowerCase() === 'yes' && !formData.imageFile) {
                newErrors.imageFile = "Please capture an image";
            }
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error('Please fix the errors before submitting.', 'error');
            setErrors(newErrors);
            return;
        }

        const payload = new FormData();
        payload.append('fullName', formData.fullName);
        payload.append('parentName', formData.parentName);
        payload.append('age', formData.age);
        payload.append('street', formData.street);
        payload.append('city', formData.city);
        payload.append('pincode', formData.pincode);
        payload.append('mobile', formData.mobile);
        payload.append('email', formData.email);
        if (formData.imageFile) {
            payload.append('imageFile', formData.imageFile);
        }

        const jsonDebug = {};
        payload.forEach((val, key) => {
            jsonDebug[key] = val;
        });
        console.log(jsonDebug);


        await fetch('/api/register', {
            method: 'POST',
            body: payload
        });

        setModalOpen(true);
        setErrors({});
        setVoiceOpt('');
        setImgSrc(null);
        // setFormData({
        //     fullName: '',
        //     parentName: '',
        //     age: '',
        //     street: '',
        //     city: '',
        //     pincode: '',
        //     mobile: '',
        //     email: '',
        //     imageFile: null
        // });

        // toast.success('Form submitted successfully!', 'success');
        // navigate('/login', { replace: true });
    }

    return (
        <>
            <Navbar />
            <div className={styles.container}>

                <h2 style={{ textAlign: "center", color: "#334EAC", fontWeight: "600" }}>Register</h2>

                <form onSubmit={handleSubmit}>

                    <div className={styles.formGrid}>
                        {/* Fullname */}
                        <div className={styles.textfieldGroup}>
                            <TextField
                                fullWidth label="Full Name" name="fullName"
                                value={formData.fullName} onChange={handleChange}
                                margin="normal"
                                required
                                error={Boolean(errors.fullName)} helperText={errors.fullName}
                            />
                            <button
                                type="button"
                                tabIndex="-1"
                                onClick={() =>
                                    listening
                                        ? handleStopMic()
                                        : handleStartMic("fullName")
                                }
                                className={styles.micButton}
                                title={activeField === "fullName" ? 'Stop' : 'Start talking'}>
                                {activeField === "fullName" ? <StopIcon style={{ color: 'red' }} /> : <MicIcon fontSize='10px' />}
                            </button>
                        </div>
                        {/* Parent name */}
                        <div className={styles.textfieldGroup}>
                            <TextField
                                fullWidth label="Parent Name" name="parentName"
                                value={formData.parentName} onChange={handleChange}
                                margin="normal"
                                required
                                error={Boolean(errors.parentName)} helperText={errors.parentName}
                            />
                            <button
                                type="button"
                                tabIndex="-1"
                                onClick={() =>
                                    listening
                                        ? handleStopMic()
                                        : handleStartMic("parentName")
                                }
                                className={styles.micButton}
                                title={activeField === "parentName" ? 'Stop' : 'Start talking'}>
                                {activeField === "parentName" ? <StopIcon style={{ color: 'red' }} /> : <MicIcon fontSize='10px' />}
                            </button>
                        </div>
                        {/* Age */}
                        <div className={styles.textfieldGroup}>
                            <TextField
                                fullWidth label="Age" name="age" type="tel"
                                value={formData.age} onChange={handleChange}
                                margin="normal"
                                required
                                error={Boolean(errors.age)} helperText={errors.age}
                            />
                            <button
                                type="button"
                                tabIndex="-1"
                                onClick={() =>
                                    listening
                                        ? handleStopMic()
                                        : handleStartMic("age")
                                }
                                className={styles.micButton}
                                title={activeField === "age" ? 'Stop' : 'Start talking'}>
                                {activeField === "age" ? <StopIcon style={{ color: 'red' }} /> : <MicIcon fontSize='10px' />}
                            </button>
                        </div>
                        {/*Street */}
                        <div className={styles.textfieldGroup}>
                            <TextField
                                fullWidth label="Street" name="street" type="text"
                                value={formData.street} onChange={handleChange}
                                margin="normal"
                                required
                                error={Boolean(errors.street)} helperText={errors.street}
                            />
                            <button
                                type="button"
                                tabIndex="-1"
                                onClick={() =>
                                    listening
                                        ? handleStopMic()
                                        : handleStartMic("street")
                                }
                                className={styles.micButton}
                                title={activeField === "address" ? 'Stop' : 'Start talking'}>
                                {activeField === "street" ? <StopIcon style={{ color: 'red' }} /> : <MicIcon fontSize='10px' />}
                            </button>
                        </div>
                        {/* City */}
                        <div className={styles.textfieldGroup}>
                            <TextField
                                fullWidth label="City" name="city" type="text"
                                value={formData.city} onChange={handleChange}
                                margin="normal"
                                required
                                error={Boolean(errors.city)} helperText={errors.city}
                            />
                            <button
                                type="button"
                                tabIndex="-1"
                                onClick={() =>
                                    listening
                                        ? handleStopMic()
                                        : handleStartMic("city")
                                }
                                className={styles.micButton}
                                title={activeField === "city" ? 'Stop' : 'Start talking'}>
                                {activeField === "city" ? <StopIcon style={{ color: 'red' }} /> : <MicIcon fontSize='10px' />}
                            </button>
                        </div>
                        {/* Pincode */}
                        <div className={styles.textfieldGroup}>
                            <TextField
                                fullWidth label="Pincode" name="pincode"
                                type="tel"
                                value={formData.pincode} onChange={handleChange}
                                margin="normal"
                                required
                                error={Boolean(errors.pincode)} helperText={errors.pincode}
                            />
                            <button
                                type="button"
                                tabIndex="-1"
                                onClick={() =>
                                    listening
                                        ? handleStopMic()
                                        : handleStartMic("pincode")
                                }
                                className={styles.micButton}
                                title={activeField === "pincode" ? 'Stop' : 'Start talking'}>
                                {activeField === "pincode" ? <StopIcon style={{ color: 'red' }} /> : <MicIcon fontSize='10px' />}
                            </button>
                        </div>
                        {/* Mobile */}
                        <div className={styles.textfieldGroup}>
                            <TextField
                                fullWidth label="Mobile Number" name="mobile" type="tel"
                                value={formData.mobile} onChange={handleChange}
                                margin="normal"
                                required
                                error={Boolean(errors.mobile)} helperText={errors.mobile}
                            />
                            <button
                                type="button"
                                tabIndex="-1"
                                onClick={() =>
                                    listening
                                        ? handleStopMic()
                                        : handleStartMic("mobile")
                                }
                                className={styles.micButton}
                                title={activeField === "mobile" ? 'Stop' : 'Start talking'}>
                                {activeField === "mobile" ? <StopIcon style={{ color: 'red' }} /> : <MicIcon fontSize='10px' />}
                            </button>
                        </div>
                        {/* Email */}
                        <div className={styles.textfieldGroup}>
                            <TextField
                                fullWidth label="Email" name="email" type="email"
                                value={formData.email} onChange={handleChange}
                                margin="normal"
                                required
                                error={Boolean(errors.email)} helperText={errors.email}
                            />
                            <button
                                type="button"
                                tabIndex="-1"
                                onClick={() =>
                                    listening
                                        ? handleStopMic()
                                        : handleStartMic("email")
                                }
                                className={styles.micButton}
                                title={activeField === "email" ? 'Stop' : 'Start talking'}>
                                {activeField === "email" ? <StopIcon style={{ color: 'red' }} /> : <MicIcon fontSize='10px' />}
                            </button>
                        </div>

                        <p className={styles.subtitle}>
                            Would you like to take a picture of yourself?
                        </p>

                        {/* Radio Buttons */}
                        <div className={styles.radioGroup}>
                            <label>
                                <input
                                    type="radio"
                                    value="yes"
                                    checked={voiceOpt === 'yes'}
                                    onChange={handleOptChange}
                                />
                                Yes
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="no"
                                    checked={voiceOpt === 'no'}
                                    onChange={handleOptChange}
                                />
                                No
                            </label>
                        </div>

                        {errors.voiceOpt && (
                            <div className={styles.imageError}>
                                {errors.voiceOpt && <span>{errors.voiceOpt}</span>}
                            </div>
                        )}
                    </div>

                    <div className={styles.submitWrapper}>

                        {/* Webcam access */}
                        {voiceOpt === 'yes' && (
                            <div className={styles.webcamContainer}>
                                {!imgSrc ? (
                                    <>
                                        <Webcam
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            videoConstraints={{
                                                facingMode: 'user',
                                            }}
                                            style={{
                                                width: '100%',
                                                maxWidth: '500px',
                                                borderRadius: '12px',
                                            }}
                                            className={styles.webcam}
                                        />
                                        {voiceOpt === 'yes' && (
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={capture} className={styles.captureButton}>📸 Capture</button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <img
                                            src={imgSrc}
                                            alt="Captured"
                                            style={{ maxWidth: '500px', borderRadius: '12px' }}
                                        />
                                        <div style={{ marginTop: '10px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setImgSrc(null)} className={styles.retakeButton}>Retake</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        {voiceOpt === 'yes' && (
                            <div className={styles.imageError}>
                                {errors.imageFile && <span>{errors.imageFile}</span>}
                            </div>
                        )}

                        <button className={styles.submitButton} type="submit">Register</button>
                    </div>
                </form>
                <div className={styles.link}>
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>

            {modalOpen && (
                <RegisterModal open={modalOpen} handleClose={handleClose} formData={formData} />
            )}
        </>
    );
};

export default RegisterVoiceBased;
