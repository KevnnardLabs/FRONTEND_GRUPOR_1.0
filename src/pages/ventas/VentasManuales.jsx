import "./ventas.scss";
import axios from "axios";
import moment from "moment/min/moment-with-locales";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import NavVentas from "./NavVentas";
import SearchIcon from "@mui/icons-material/Search";
import Alerta from "../../components/Alerta";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import useAuth from "../../hooks/useAuth";
import io from "socket.io-client";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import CardOnline from "../../components/Online/CardOnline";

function VentasManuales() {
  moment.locale("es-us");
  const params = useParams();
  const { id } = params;

  const auth = useAuth();
  const navigate = useNavigate();
  //ventas Sac
  const [ventas, setventas] = useState({});
  const [ventass, setVentas] = useState(false);

  //obtener venta por # de venta
  const [ventaN, setventaN] = useState("");
  const [ventaProvicional, setVentaProvicional] = useState([]);
  const [ventaProvicionalState, setVentaProvicionalState] = useState(false);

  //
  // obtener vetas por estado de pedido
  const [ventasEstado, setVentasEstado] = useState("");

  // Alerta de mensaje
  const [online, setOnline] = useState({});
  const [alerta, setAlerta] = useState({});

  // paginacion de productos
  const [page, setPage] = useState(1);
  const [page2, setPage2] = useState(1);

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleToggle = () => {
    setOpen(!open);
  };

  const handlePage = async (event, value) => {
    if (ventasEstado === "") {
      setPage(value);
      obtenerVentasManuales();
    } else {
      setPage2(value);
      obtenerVentasManualesEstado();
    }
  };

  const [buttonEstado, setButtonEstado] = useState(true);
  const ontenerventasShopify = async () => {
    try {
      handleToggle();
      setButtonEstado(false);
      setTimeout(() => {
        obtenerVentasManuales();
        handleClose();
      }, 7000);
      setTimeout(() => {
        obtenerVentasManuales();
        setAlerta({});
      }, 15000);
      setTimeout(() => {
        obtenerVentasManuales();
      }, 30000);
      setTimeout(() => {
        obtenerVentasManuales();
        setButtonEstado(true);
      }, 60000);
      setAlerta({
        msg: "No recargue la pagina mientras se consulta",
        error: true,
      });
      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/dashboard/ventas-shopify/notify`;
      await axios.get(url).catch((error) => {
        console.log(error);
      });
    } catch (error) {
      setVentas(false);
    }
  };

  const obtenerVentasManuales = async () => {
    try {
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/dashboard/ventas-manuales/pendientes/${id}`,
        {
          page,
        }
      );
      setventas(data);
      setVentas(true);
    } catch (error) {
      console.log(error);
      setVentas(false);
    }
  };

  const obtenerVentasManualesEstado = async () => {
    try {
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/dashboard/ventas-manuales/pendientes/estado`,
        {
          page2,
          ventasEstado,
        }
      );
      setventas(data);
      setVentas(true);
    } catch (error) {
      console.log(error);
      setVentas(false);
    }
  };

  const obtenerVentaPorNumero = async (e) => {
    try {
      if (ventaN == "") {
        setAlerta({ msg: "Escribe un numero para buscar", error: true });
        setTimeout(() => {
          setAlerta({});
        }, 3000);
      } else {
        const { data } = await axios.post(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/dashboard/ventas-manuales/obtenerventa`,
          {
            ventaN,
          }
        );
        if (data.error == true) {
          setAlerta({ msg: data.msg, error: true });
          setTimeout(() => {
            setAlerta({});
          }, 3000);
        } else {
          setVentas(false);
          setventas({});
          setVentaProvicional({ data });
          setVentaProvicionalState(true);
          setventas("");
          setventaN("");
          setAlerta({
            msg: data.msg,
            error: data.error,
          });
          setTimeout(() => {
            setAlerta({});
          }, 3000);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerVentasManuales();
  }, []);

  let socket;
  useEffect(() => {
    socket = io(import.meta.env.VITE_BACKEND_URL);
    socket.emit("despachos", { id, auth });
  }, []);
  useEffect(() => {
    socket.on("userDespachos", ({ usuario }) => {
      setButtonEstado(false);
    });
    socket.on("ventasEstadoChange", (data) => {
      setTimeout(() => {
        obtenerVentasManuales();
      }, 100);
    });
  }, []);

  let total = 0;
  let totall = 0;
  
  let i = 0;
  if (ventass) {
    for (i in ventas.docs) {
      if (i.estado_pedido == "enviado") {
        break;
      } else {
        i++;
      }
    }
  }
  const { msgOnline } = online;
  const { msg } = alerta;
  let cont = 1;
  return (
    <>
      {auth.role === "DESPACHO" || "ADMIN" ? (
        <>
          <NavVentas />
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={open}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
          {msg && <Alerta alerta={alerta} />}
          {msgOnline && <CardOnline online={online} />}
          <h1 className="tit_pri_ventas">
            PEDIDOS PENDIENTES:{" "}
            <span
              style={{
                color: "#f00",
                padding: "3px",
                borderRadius: "20px",
                fontSize: "2.2rem",
              }}
            >
              {ventas.totalDocs}
            </span>
          </h1>
          <div className="buscar_productos">
            <div>
              <input
                trim
                placeholder="BUSCAR POR NUMERO DE VENTA"
                value={ventaN}
                onChange={(e) => setventaN(e.target.value.trim().toUpperCase())}
              />
              <SearchIcon className="icon" onClick={obtenerVentaPorNumero} />
            </div>
            <div className="filtar_estado_pedidos_despachos select">
              <select
                name=""
                id=""
                onChange={(e) => setVentasEstado(e.target.value)}
                onClickCapture={obtenerVentasManualesEstado}
              >
                <option selected value="" disabled>
                  Filtrar por estado de pedido
                </option>
                <option value="pendiente">Pendiente</option>
                <option value="parcial">Por Completar</option>
                <option value="solicitado">Solicitado</option>
              </select>
            </div>

            {/* <div>
              <input placeholder="BUSCAR POR # CEDULA" />
          <SearchIcon className="icon" onClick={obtenerVentaPorNumero} />
            </div> */}
            {buttonEstado == true ? (
              <div>
                <button
                  className="btnn"
                  style={{ background: "#F00", color: "#FFF" }}
                  onClick={ontenerventasShopify}
                >
                  ACtualizar Bandeja
                </button>
              </div>
            ) : null}
          </div>
          {ventass == true ? (
            <div className="paginate_productos">
              <Stack spacing={1}>
                <Pagination
                  count={ventas.totalPages}
                  variant="outlined"
                  page={ventas.page ? ventas.page : ventas.page2}
                  color="secondary"
                  onChange={handlePage}
                  hideNextButton
                />
              </Stack>
            </div>
          ) : (
            ""
          )}
          <main className="main_pri_ventas">
            <table>
              <thead>
                <th>#</th>
                <th>Fecha</th>
                <th>venta</th>
                <th>nombre</th>
                <th>ciudad</th>
                <th>Telefono</th>
                <th>metodo de pago</th>
                <th># productos</th>
                <th>Accion</th>
              </thead>
              {ventass == true
                ? ventas.docs.map((item) => (
                    <>
                      <tr
                        style={
                          item.estado_pedido == "pendiente"
                            ? { background: "#f00", color: "#fff" }
                            : { background: "#ff", color: "#000" } &&
                              item.estado_pedido == "parcial"
                            ? { background: "#aed3e3", color: "#000" }
                            : {
                                background: "rgba(255, 255, 0, .5)",
                                color: "#000",
                              }
                        }
                        key={item._id}
                      >
                        <td>{cont++}</td>
                        {item.tienda == "Shopify" ? (
                          <td>{moment(item.fechaShopify).format("LLL")}</td>
                        ) : (
                          <td>{moment(item.fecha).format("LLL")}</td>
                        )}
                        <td>{`${item.nuVenta}`}</td>
                        <td>{item.cliente.nombre}</td>
                        <td>{item.cliente.ciudad}</td>
                        <td>{item.cliente.telefono}</td>
                        <td>
                          {item.pago.metodo_pago == "Cash on Delivery (COD)"
                            ? "Pago Contra entrega"
                            : item.pago.metodo_pago &&
                              item.pago.metodo_pago ==
                                "addi stating payment app"
                            ? "Credito Addi"
                            : item.pago.metodo_pago}
                        </td>
                        <td>{item.productos.length}</td>
                        <td>
                          <Link
                            style={{
                              fontSize: "1rem",
                              background: "#fff",
                              color: "#000",
                              padding: "5px",
                              borderRadius: "5px",
                            }}
                            to={`/dashboard/ventas-manuales/${item._id}`}
                          >
                            Editar
                          </Link>
                        </td>
                      </tr>
                    </>
                  ))
                : null}
              {ventaProvicionalState == true ? (
                <>
                  <tr
                    style={
                      ventaProvicional.data.estado_pedido == "solicitado"
                        ? { background: "rgba(255, 255, 0, .5)", color: "#000" }
                        : { background: "#f00", color: "#fff" } &&
                          ventaProvicional.data.estado_pedido == "enviado"
                        ? { background: "#006400", color: "#000" }
                        : { background: "#f00", color: "#fff" } &&
                          ventaProvicional.data.estado_pedido == "parcial"
                        ? { background: "#aed3e3", color: "#000" }
                        : { background: "#f00", color: "#fff" } &&
                          ventaProvicional.data.estado_pedido == "cancelado"
                        ? { background: "#777", color: "#fff" }
                        : { background: "#f00", color: "#fff" } &&
                          ventaProvicional.data.estado_pedido == "fallido"
                        ? { background: "#777", color: "#fff" }
                        : { background: "#f00", color: "#fff" } &&
                          ventaProvicional.data.estado_pedido == "novedad"
                        ? { background: "#ff8000", color: "#fff" }
                        : { background: "#f00", color: "#fff" } &&
                          ventaProvicional.data.estado_pedido == "cambio"
                        ? { background: "#00f", color: "#FFF" }
                        : { background: "#f00", color: "#fff" } &&
                          ventaProvicional.data.estado_pedido == "facturar"
                        ? { background: "#4b3629", color: "#FFF" }
                        : { background: "#f00", color: "#fff" } &&
                          ventaProvicional.data.estado_pedido == "finalizado"
                        ? { background: "#000000", color: "#fff" }
                        : { background: "#f00", color: "#fff" }
                    }
                    key={ventaProvicional.data._id}
                  >
                    <td>{cont++}</td>
                    {ventaProvicional.data.tienda == "Shopify" ? (
                      <td>
                        {moment(ventaProvicional.data.fechaShopify).format(
                          "LLL"
                        )}
                      </td>
                    ) : (
                      <td>
                        {moment(ventaProvicional.data.fecha).format("LLL")}
                      </td>
                    )}
                    <td>{`${ventaProvicional.data.nuVenta}`}</td>
                    <td>{ventaProvicional.data.cliente.nombre}</td>
                    <td>{ventaProvicional.data.cliente.ciudad}</td>
                    <td>{ventaProvicional.data.cliente.telefono}</td>
                    <td>
                      {ventaProvicional.data.pago.metodo_pago ==
                      "Cash on Delivery (COD)"
                        ? "Pago Contra entrega"
                        : ventaProvicional.data.pago.metodo_pago &&
                          ventaProvicional.data.pago.metodo_pago ==
                            "addi stating payment app"
                        ? "Credito Addi"
                        : ventaProvicional.data.pago.metodo_pago}
                    </td>
                    <td>{ventaProvicional.data.productos.length}</td>
                    <td>
                      <Link
                        style={{
                          fontSize: "1rem",
                          background: "#fff",
                          color: "#000",
                          padding: "5px",
                          borderRadius: "5px",
                        }}
                        to={`/dashboard/ventas-manuales/${ventaProvicional.data._id}`}
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                </>
              ) : null}
            </table>
            {ventass == true ? (
              <div className="paginate_productos">
                <Stack spacing={1}>
                  <Pagination
                    count={ventas.totalPages}
                    variant="outlined"
                    page={ventas.page ? ventas.page : ventas.page2}
                    color="secondary"
                    onChange={handlePage}
                    hideNextButton
                  />
                </Stack>
              </div>
            ) : (
              ""
            )}
          </main>
        </>
      ) : (
        navigate("/dashboard")
      )}
    </>
  );
}

export default VentasManuales;