import axios from "axios";
import { getCafe24Token } from "./src/main/cafe24";

async function test() {
  try {
    const token = await getCafe24Token("wiseteam");
    const payload = {
      shop_no: 1,
      request: {
        product_no: [31]
      }
    };

    console.log("Sending Payload mapping product 31 to category 32:", JSON.stringify(payload, null, 2));

    const res = await axios.post("https://wiseteam.cafe24api.com/api/v2/admin/categories/32/products", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log("Response:", JSON.stringify(res.data, null, 2));
  } catch (e) {
    if (e.response) {
       console.error("API Error Response:", JSON.stringify(e.response.data, null, 2));
    } else {
       console.error("Network Error:", e.message);
    }
  }
}
test();
