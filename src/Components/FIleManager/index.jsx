import React, { useEffect, useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';

import { searchFileManagers } from "../../graphql/queries";
import ListFIles from "./ListFIles";
import FileUploadeCompont from "./FIleUploader";
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import styles from "./FIleUploader.module.css"
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper'
import ItemFIlter from './ItemFIlter';


export default function FileManager() {
  const [refresh, setRefresh] = useState(0);
  const [fileManagers, setFileManagers] = useState([]);
  const [limit] = useState(5);
  // const [total, setTotal] = useState(1)
  const [totalPageCount, setTotalPageCount] = useState(0)
  // const [nextToken, setNextToken] = useState(undefined);
  const [from, setFrom] = useState(0)
  const [page, setPage] = useState(1)
  const [sortBy] = useState('createdAt')
  const [sortOrder,] = useState('desc')
  const [loading, setLoading] = useState(false)
  const [filterParams, setFilterParams] = useState({
    category: '',
    subCategory: '',
    elab: '',
    startDate: null,
    endDate: null
  })

  const getFiles = async () => {
    setLoading(true)
    try {
      const query = {
        limit: limit, from: from,
        sort: { field: sortBy, direction: sortOrder },
        // nextToken: nextToken
      }

      if (filterParams.category || filterParams.subCategory || filterParams.elab || (filterParams.startDate && filterParams.endDate)) {
        const allParams = { ...filterParams }
        query.filter = {}

        if (allParams.startDate && allParams.endDate) {
          query.filter.createdAt = { range: [allParams.startDate, allParams.endDate] }
        }
        delete allParams.startDate
        delete allParams.endDate
        Object.keys(allParams).forEach((key) => {
          const value = allParams[key];
          if (value) {
            query.filter[key] = { eq: value }
          }
        })
      }

      const result = await API.graphql(
        graphqlOperation(searchFileManagers,
          {
            ...query
          }
        )
      );
      console.log(result);
      let listItemResult = result.data.searchFileManagers;
      setFileManagers(listItemResult.items);
      // setTotal(listItemResult.total)
      if (listItemResult.total > 0) {
        console.log(" total page count ", Math.ceil(listItemResult.total / limit))
        setTotalPageCount(Math.ceil(listItemResult.total / limit))
      } else {
        setTotalPageCount(0)
        setPage(1)
        setFrom(0)
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefresh(refresh + 1);
  }

  useEffect(() => {
    getFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);


  function handlePageChange(_, value) {
    console.log("page change ", value)
    if (+value !== +page) {
      const newFrom = (+value * limit) - limit;
      console.log("new from ", newFrom)
      setFrom(newFrom)
      setPage(+value)
      setRefresh(refresh + 1);
    }
  }

  return (
    <Container maxWidth="lg" style={{ margin: "0 auto" }}>

      <Paper className={styles.File_Manager_Component}>

        <FileUploadeCompont handleRefresh={handleRefresh} />
      </Paper>

      <h2>List Files</h2>
      <ItemFIlter
        filterParams={filterParams}
        setFilterParams={setFilterParams}
        handleRefresh={handleRefresh}
        setFrom={setFrom}
        setPage={setPage}
      />
      {
        loading &&
        <div className={styles.pagination_container}>
          <CircularProgress />
        </div>
      }
      {
        !loading && fileManagers.length === 0 &&
        <div className={styles.pagination_container}>
          <p>No item found</p>
        </div>
      }
      {
        !loading && fileManagers.length > 0 &&
        <ListFIles
          listItems={fileManagers}
          handleRefresh={handleRefresh}

        />
      }
      <div className={styles.pagination_container}>
        <Stack spacing={2} >
          <Pagination count={totalPageCount} color="primary" onChange={handlePageChange} />
        </Stack>
      </div>

    </Container>
  );
}