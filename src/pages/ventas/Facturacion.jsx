import "./ventas.scss";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavVentas from "./NavVentas";
import useAuth from "../../hooks/useAuth";

function Facturacion() {
  // auth
  const auth = useAuth();
  const navigate = useNavigate();
  //ventas Sac
  const [ventas, setventas] = useState({});
  const [ventass, setVentas] = useState(false);

  const obtenerVentasManuales = async () => {
    try {
      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/dashboard/ventas-manuales/facturacion`;
      const { data } = await axios.post(url);
      setventas(data);
      setVentas(true);
    } catch (error) {
      console.log(error);
      setVentas(false);
    }
  };

  useEffect(() => {
    obtenerVentasManuales();
  }, []);

  const actualizar = async () => {
    window.location.reload(true);
  };

  let i = 0;
  if (ventass) {
    for (i in ventas) {
      if (i.estado_pedido == "facturar") {
        break;
      } else {
        i++;
      }
    }
  }

  let cont = 1;
  return (
    <>
      {auth.role === "SERVICIO" || "ADMIN" ? (
        <>
          <NavVentas />
          <h1 className="tit_pri_ventas">
            PEDIDOS PENDIENTES DE FACTURA{" "}
            <span
              style={{
                color: "#f00",
                padding: "3px",
                borderRadius: "20px",
                fontSize: "2.2rem",
              }}
            >
              {i}
            </span>
          </h1>
          {/* <div className="buscar_ventas">
        <input placeholder="Buscar por sku" />
        <input placeholder="Buscar por nombre" />
        <input placeholder="Selecciona marca" />
      </div> */}
          <div className="buscar_productos">
            <button
              className="btnn"
              style={{ background: "#f00", color: "#fff" }}
              onClick={actualizar}
            >
              ACtualizar Bandeja
            </button>
          </div>
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
                <th>Valor Total</th>
                <th>Accion</th>
              </thead>
              {ventass == true
                ? ventas.map((item) => (
                    <>
                      <tr
                        style={{ background: "#4b3629", color: "#fff" }}
                        key={item._id}
                      >
                        <td>{cont++}</td>
                        {item.tienda == "Shopify" ? (
                          <td>
                            {new Date(item.fechaShopify).toLocaleDateString()} A
                            las{" "}
                            {new Date(item.fechaShopify).toLocaleTimeString()}
                          </td>
                        ) : (
                          <td>
                            {new Date(item.fecha).toLocaleDateString()} A las{" "}
                            {new Date(item.fecha).toLocaleTimeString()}
                          </td>
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
                        <td>
                          {item.tienda == "Shopify" ? (
                            <>
                              {"$" +
                                Intl.NumberFormat("es-ES", {
                                  style: "currency",
                                  currency: "COP",
                                  minimumFractionDigits: 0,
                                }).format(item.ventaTotalShopify)}
                            </>
                          ) : (
                            <>
                              {"$" +
                                Intl.NumberFormat("es-ES", {
                                  style: "currency",
                                  currency: "COP",
                                  minimumFractionDigits: 0,
                                }).format(item.precio)}
                            </>
                          )}
                        </td>
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
            </table>
          </main>
        </>
      ) : (
        navigate("/dashboard")
      )}
    </>
  );
}

export default Facturacion;