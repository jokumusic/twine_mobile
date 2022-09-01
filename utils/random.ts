export const generateRandomString = (length: number) => {
    const char = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    const random = Array.from(
        {length: length},
        () => char[Math.floor(Math.random() * char.length)]
    );
    const randomString = random.join("");
    return randomString;
};

export const generateRandomU16 = () => {
    return Math.floor(Math.random() * Math.pow(2,16));
};
  
export const generateRandomU32 = () => {
    return Math.floor(Math.random() * Math.pow(2,16));
};
  
export const uIntToBytes = (num, size, method) => {
    const arr = new ArrayBuffer(size)
    const view = new DataView(arr)
    view[method + (size * 8)](0, num)
    return arr
};
  
export const toBytes = (data, type) =>
    type == "u8"  ? uIntToBytes(data, 1, "setUint") :
    type == "u16" ? uIntToBytes(data, 2, "setUint") :
    type == "u32" ? uIntToBytes(data, 4, "setUint") :
    type == "u64" ? uIntToBytes(BigInt(data), 8, "setBigUint")
                  : `Not Sure about type - ${type}`