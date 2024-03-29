import React from "react";
import { SnackbarProvider, useSnackbar } from "notistack";
import { useState, useEffect } from "react";

function CardOnline({online}) {

  const [user, setUser] = useState("");
  const [userError, setUserError] = useState("")
  const [mesagge, setMesagge] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  // const handleClick = () => {
  //   enqueueSnackbar(user);
  // };


  const handleClickVariant = (variant) =>  {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar(`${user}, ${userError ? `${mesagge}` : `${mesagge}`}`, {
      variant,
    });
  };
  
  useEffect(() => {
       if(online === undefined) {
        return console.log("undefindes");
       } else {
        if (userError == true) {
          setUser(online.msgOnline);
          setUserError(online.error);
          setMesagge(online.mesagge);
          handleClickVariant("success");
        } else {
          setUser(online.msgOnline);
          setUserError(online.error);
          setMesagge(online.mesagge);
          handleClickVariant("error");
        }
       }
  });


  return (
    <React.Fragment>
      {/* <Button onLoad={handleClick}></Button> */}
      {/* <Button onLoad={handleClickVariant("success")}></Button> */}
    </React.Fragment>
  );
}

export default function IntegrationNotistack({online}) {
  return (
    <SnackbarProvider maxSnack={5}>
      <CardOnline online={online} />
    </SnackbarProvider>
  );
}
