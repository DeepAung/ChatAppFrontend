import { Token } from "@/types/Token";

export async function fetchData(
  path: string,
  method: string,
  body: object | FormData,
  token: Token | undefined,
  useJson: boolean = true
) {
  let headers: any = { Authorization: token ? "Bearer " + token.access : "" };
  if (useJson) headers["Content-Type"] = "application/json";

  let bodyData: any = body;
  if (useJson)
    bodyData = Object.keys(body).length == 0 ? null : JSON.stringify(body);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_PREFIX}${process.env.NEXT_PUBLIC_API_URL}/api/${path}`,
    {
      method: method,
      headers: headers,
      body: bodyData,
    }
  );

  let data: any;
  try {
    data = await res.json();
  } catch (err) {
    throw {
      error: new Error(res.statusText),
      res,
      data: {},
    };
  }

  if (res.ok) {
    return data;
  } else {
    throw {
      error: new Error(res.statusText),
      res,
      data,
    };
  }
}
