export default class TextInput {
    async getText (msg) {
//         const resp = prompt(msg)
//         return Promise.resolve(resp)
//     }
// }

        let resp;
        do {
            resp = prompt(msg)

            // Handle esc or Cancel
            if (!resp) {
                resp = confirm('Are you sure you want to exit?')

                // OK with exit?
                if (resp) {
                    resp = 'EXIT'
                } else {
                    resp = null;
                }
            }
        } while (!resp);

        return Promise.resolve(resp)
    }
}