export const generateRandomString = (length: number) => {
    const char = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    const random = Array.from(
        {length: length},
        () => char[Math.floor(Math.random() * char.length)]
    );
    const randomString = random.join("");
    return randomString;
}