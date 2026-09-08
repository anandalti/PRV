const freeVent_FV = [
    {ModelId:"7000", Data:[
        {InletFinish:{ Value : "FF", Condition : [{ST:"7000"} ]}},{InletRating:{ Value : "150#", Condition : [{ST:"7000"} ]}},{InletConn:{ Value : "Drilling", Condition : [{ST:"7000"} ]}},{Outlet:{ Value : "Vent to Atmosphere", Condition : [{ST:"7000"} ]}},{Standard:{ Value : "ANSI B16.5", Condition : [{ST:"7000"} ]}},{Base:{ Value : "Aluminum", Condition : [{ST:"7000"} ]}},{Hood:{ Value : "Aluminum", Condition : [{ST:"7000"} ]}},
        {InletSize:{ Value : "2", Condition : [{SZ:"02"} ]}},
        {InletSize:{ Value : "3", Condition : [{SZ:"03"} ]}},
        {InletSize:{ Value : "4", Condition : [{SZ:"04"} ]}},
        {InletSize:{ Value : "6", Condition : [{SZ:"06"} ]}},
        {InletSize:{ Value : "8", Condition : [{SZ:"08"} ]}},
        {InletSize:{ Value : "10", Condition : [{SZ:"10"} ]}},
        {InletSize:{ Value : "12", Condition : [{SZ:"12"} ]}}
        ]}
        
]

module.exports = {
    freeVent_FV
};