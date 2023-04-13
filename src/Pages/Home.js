import React from 'react'
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import FileUploadeCompont from '../Components/FIleManager/FIleUploader';

export default function Home() {
  return (
    <Container maxWidth="xl" style={{ margin: "0 auto" }}>
      <Paper elevation={3} style={{ padding: "20px" }}>
        <FileUploadeCompont />
      </Paper>  
    </Container>
  )
}
