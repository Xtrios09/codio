import React from 'react';
import { ClipLoader } from 'react-spinners';

const LoadingSpinner = () => {
  return (
    <div style={styles.loaderContainer}>
      <ClipLoader color="#36D7B7" size={50} />
      <p style={styles.loadingText}>Loading...</p>
    </div>
  );
};

const styles = {
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#282c34',
    color: 'white',
  },
  loadingText: {
    marginTop: '20px',
    fontSize: '20px',
  },
};

export default LoadingSpinner;
