const calculateKv = ({ Kv, N13, N14, N15, A, U, Kz, Kw, Kc, Pa, Pb, SG, Ao, Vreq, Code, ViscosityCorrectionFactor }) => {
    let R;
   
    if (!ViscosityCorrectionFactor) {
        let KvDiff = 1;
        while (KvDiff > 0.000001) {
            V = N13 * A * Kz * Kw * Kc * Kv * ((Pa - Pb) / SG) ** 0.5;
            let Kvtemp = Kv;
            R = (N14 * V * SG) / (U * A ** 0.5);
            Kv = (0.9935 + (2.878 / R ** 0.5) + (342.75 / R ** 1.5)) ** (-1);
            KvDiff = Math.abs(Kvtemp - Kv)
        }
        if (Kv > 1) {
            Kv = 1;
            V = N13 * A * Kz * Kw * Kc * Kv * ((Pa - Pb) / SG) ** 0.5;
            R = (N14 * V * SG) / (U * A ** 0.5);
        }
        else if (Kv < 0.3) {
            Kv = 0;
            V = N13 * A * Kz * Kw * Kc * Kv * ((Pa - Pb) / SG) ** 0.5;
        }
    } else {
        V = N13 * A * Kz * Kw * Kc * 1 * ((Pa - Pb) / SG) ** 0.5;
        R = (N14 * V * SG) / (U * A ** 0.5);
    }
    let Kvreq = 1;
    let Rreq = (N14 * Vreq * SG) / (U * A ** 0.5)
    if (!!Vreq && !ViscosityCorrectionFactor) {  
        Kvreq = (0.9935 + (2.878 / Rreq ** 0.5) + (342.75 / Rreq ** 1.5)) ** (-1)
    }
    if(Kvreq > 1) {
        Kvreq = 1;
    }
    
    return { Kv, V, Kvreq, R, Rreq };
}

const TestcalculateKv = ({ Kv, N13, N14, N15, A, U, Kz, Kw, Kc, Pa, Pb, SG, Ao, Vreq, Code, ViscosityCorrectionFactor,ModelNumber,Orifice }) => {
    let R;
   
    if (!ViscosityCorrectionFactor) {
        let KvDiff = 1;
        while (KvDiff > 0.000001) {
            V = N13 * A * Kz * Kw * Kc * Kv * ((Pa - Pb) / SG) ** 0.5;
            let Kvtemp = Kv;
            R = (N14 * V * SG) / (U * A ** 0.5);
            Kv = (0.9935 + (2.878 / R ** 0.5) + (342.75 / R ** 1.5)) ** (-1);
            KvDiff = Math.abs(Kvtemp - Kv)
        }
        if (Kv > 1) {
            Kv = 1;
            V = N13 * A * Kz * Kw * Kc * Kv * ((Pa - Pb) / SG) ** 0.5;
        }
        else if (Kv < 0.3) {
            Kv = 0;
            V = N13 * A * Kz * Kw * Kc * Kv * ((Pa - Pb) / SG) ** 0.5;
        }
    } else {
        V = N13 * A * Kz * Kw * Kc * 1 * ((Pa - Pb) / SG) ** 0.5;
        R = (N14 * V * SG) / (U * A ** 0.5);
    }
    if(ModelNumber=='463' || ModelNumber=='566'){
        
    }
    let Kvreq = 1;
    let Rreq = (N14 * Vreq * SG) / (U * A ** 0.5)
    if (!!Vreq && !ViscosityCorrectionFactor) {  
        Kvreq = (0.9935 + (2.878 / Rreq ** 0.5) + (342.75 / Rreq ** 1.5)) ** (-1)
    }
    if(Kvreq > 1) {
        Kvreq = 1;
    }
    
    return { Kv, V, Kvreq, R, Rreq };
}

module.exports = {
    calculateKv,
    TestcalculateKv
};