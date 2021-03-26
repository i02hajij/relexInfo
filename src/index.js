const axios = require('axios');
const moment = require('moment');

// Tiendas piloto Reles 59, 481
// Nuevas pilotos 16/3 -> 70, 189, 18167
// Nuevas pilotos 23/3 -> 129, 175, 424

// Tiendas piloto
const pilotos = [59, 481, 70, 189, 18167, 129, 175, 424];
/*const pilotos = [
  419,
  461,
  473,
  4144,
  9793,
  9829,
  10010,
  19505,
  52507,
  52573,
  98072,
];*/
// Para mostrar detalle de artículos o no
const verDetalleArticulos = false;

const obtenerCabecera = async (tienda) => {
  try {
    const url =
      'https://supply-orders-api.es.pro.store.dgrp.io/orders-api/orders/stores/' +
      tienda +
      '/proposals';
    const res = await axios.get(url).then((res) => {
      return res;
    });
    return res;
  } catch (e) {
    console.log(e);
  }
};

const obtenerDetalle = async (tienda, propuesta) => {
  try {
    const urlDetalle =
      'https://supply-orders-api.es.pro.store.dgrp.io/orders-api/orders/stores/' +
      tienda +
      '/proposals/' +
      propuesta;
    const res = await axios.get(urlDetalle).then((res) => {
      return res;
    });
    return res;
  } catch (e) {
    console.log(e);
  }
};

const obtenerDatosRelex = async () => {
  // Nos recorremos cada tienda
  for (let i = 0; i < pilotos.length; i++) {
    const tienda = pilotos[i];
    // Obtengo las cabeceras
    const cabeceras = await obtenerCabecera(tienda);
    // Por cada propuesta de la tienda
    console.log('INFORME TIENDA ' + tienda);
    console.log('---------------------');
    console.log('Número de propuestas = ' + cabeceras.data.length);

    let totalArticulos = 0;

    for (let j = 0; j < cabeceras.data.length; j++) {
      const propuesta = cabeceras.data[j].orderProposalCode;
      const detalle = await obtenerDetalle(tienda, propuesta);
      const letras = [];
      for (let z = 0; z < cabeceras.data[j].orderItemTypeInfo.length; z++) {
        if (cabeceras.data[j].orderItemTypeInfo[z].orderItemType != undefined) {
          letras.push(cabeceras.data[j].orderItemTypeInfo[z].orderItemType);
        }
      }
      let mensaje =
        '  Propuesta ' +
        propuesta +
        ' de tipo ' +
        cabeceras.data[j].orderType +
        ' - Nº Artículos = ' +
        detalle.data.length;
      // vamos totalizando
      totalArticulos += detalle.data.length;

      if (cabeceras.data[j].orderType != 'MANUAL_RELEX') {
        const horaConfirmacion = moment(
          cabeceras.data[j].proposalDeadlineDateTime
        ).format('HH:mm:ss');
        const ahora = moment().format('HH:mm:ss');
        mensaje += ' - Letras = ' + letras.toString();

        if (
          cabeceras.data[j].orderType == 'RELEX' ||
          cabeceras.data[j].orderType == 'AUTOMATIC_APT2'
        ) {
          mensaje += ' - Se autoconfirmará a las ' + horaConfirmacion;
        }
      }
      console.log(mensaje);

      if (verDetalleArticulos) {
        for (let y = 0; y < detalle.data.length; y++) {
          console.log(
            '    Artículo ' +
              detalle.data[y].itemCode +
              ' - Tipo ' +
              detalle.data[y].quantityFormat +
              ' - Cantidad = ' +
              detalle.data[y].proposalQuantity +
              ' - ' +
              detalle.data[y].modifiedQuantity
          );
        }
      }
    }
    console.log('Total artículos = ' + totalArticulos);
    console.log('\n');
  }
};

obtenerDatosRelex();
