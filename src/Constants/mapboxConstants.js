export const ACCESS_TOKEN =
    "pk.eyJ1IjoiZXRlcm5pdGVjaCIsImEiOiJjbGp3djU5N28xczRsM2JuZ3h0NG1iZWZoIn0.Ef8zkzCW9v9tFrowdiacrQ";

export const API_TOKEN =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X29iamVjdF9pZCI6Mzk5MTU4NzUsInVzZXJfaWQiOiI0MDY2NTAyMSIsInVzZXJfbmFtZSI6InN5c3RlbStsdW5hLTh5NXljIiwic2NvcGUiOlsiYnJpdm8uYXBpIl0sImlzc3VlZCI6IjE2NzUxMTI3NDYxMzYiLCJleHAiOjE2NzUxMTI4MDYsInNlcnZpY2VfdG9rZW4iOm51bGwsImF1dGhvcml0aWVzIjpbIlJPTEVfU1VQRVJfQURNSU4iLCJST0xFX0FETUlOIl0sImp0aSI6ImVmNzY1MDIyLTZhNzctNGZkMy04Njg1LTFhZTFhZmEzOTJhZSIsImNsaWVudF9pZCI6IjkzOTFlYjVkLWUwNmUtNDY4MS1iNTdhLWQwZTU3NDhhM2RlZSIsIndoaXRlX2xpc3RlZCI6ZmFsc2V9.N9MIeiLyrT3hBUtMJsTvwbYW5Z_o7ZSBuZmir2ytrb8DiE4MoXcmh8C6KriWhmnRqUnSMBRtuLcauVbqjFTorOcWMOd2RQGmisPgXBm1tHT30Hl0i57rQuLZHAVW201ot-TdQwW9oEZ3n2HTGu_A6tRhTizVmG6NRAd5KhOB2_c";

export const defaultContinent = {
    type: "FeatureCollection",
    features: [
        {
            // South America
            type: "Feature",
            properties: {},
            geometry: {
                coordinates: [-65.03566465880945, 0.11347580615962916],
                type: "Point",
            },
        },
        {
            // Asia
            type: "Feature",
            properties: {},
            geometry: {
                coordinates: [94.04635205722194, 55.40990487833411],
                type: "Point",
            },
        },
        {
            // North America
            type: "Feature",
            properties: {},
            geometry: {
                coordinates: [-104.7622254741253, 35.40990487833411],
                type: "Point",
            },
        },
        {
            // Europe
            type: "Feature",
            properties: {},
            geometry: {
                coordinates: [22.493409953059988, 54.55934494957344],
                type: "Point",
            },
        },
        {
            // Africa
            type: "Feature",
            properties: {},
            geometry: {
                coordinates: [15.301302, 15.645186],
                type: "Point",
            },
        },
    ],
};

export const DESTINATIONS_API = "https://api.triangle.luxury/local/destinations"