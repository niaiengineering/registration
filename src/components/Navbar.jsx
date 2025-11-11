import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { House } from 'lucide-react';
import HomeIcon from '@mui/icons-material/Home';
import styles from "../styles/Navbar.module.css";

const Navbar = () => {
    const location = useLocation();
    const paths = location.pathname.split("/").filter((path) => path);

    // helper function: split by hyphen and capitalize each word
    const formatPath = (path) => {
        return path
            .split("-") // split words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize
            .join(" "); // join back with space
    };

    // const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    // useEffect(() => {
    //     document.documentElement.setAttribute("data-theme", theme);
    //     localStorage.setItem("theme", theme);
    // }, [theme]);

    return (
        <>
            <nav className={styles.navbar}>
                {/* Left Section - Logo */}
                <div className={styles.logo}>
                    <h3>IPC</h3>
                    <p className={styles.heading}>Integrated Patient Care</p>
                </div>
                {/* <button
                    className={styles.themeToggle}
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                    {theme === "light" ? (
                        <>
                            <DarkModeIcon />
                        </>
                    ) : (
                        <>
                            <LightModeIcon />
                        </>
                    )}
                </button> */}

            </nav>
            {/* <nav aria-label="breadcrumb">
                <ol className={styles.breadcrumb}>
                    <li className={styles.breadcrumbitem}>

                        <Link to="/"><HomeIcon sx={{ fontSize: 20 }} /></Link>
                    </li>
                    {paths.map((path, index) => {
                        const url = `/${paths.slice(0, index + 1).join("/")}`;
                        const formattedPath = formatPath(path);

                        return (
                            <li key={url} className={styles.breadcrumbitem}>
                                <Link to={url}>{formattedPath}</Link>
                            </li>
                        );
                    })}
                </ol>
            </nav> */}

            <nav aria-label="breadcrumb">
                <ol className={styles.breadcrumb}>
                    <li className={styles.breadcrumbitem}>
                        <Link to="/">
                            <House size={20} style={{ verticalAlign: "middle" }} />
                        </Link>
                    </li>

                    {paths.map((path, index) => {
                        const url = `/${paths.slice(0, index + 1).join("/")}`;
                        const formattedPath = formatPath(path);
                        const isLast = index === paths.length - 1;

                        return (
                            <React.Fragment key={url}>
                                <li className={styles.breadcrumbseparator}>
                                    <NavigateNextIcon sx={{ fontSize: 25 }} />
                                </li>
                                <li
                                    className={`${styles.breadcrumbitem} ${isLast ? styles.active : ""
                                        }`}
                                >
                                    <Link to={url}>{formattedPath}</Link>
                                </li>
                            </React.Fragment>
                        );
                    })}
                </ol>
            </nav>
        </>
    );
};

export default Navbar;
