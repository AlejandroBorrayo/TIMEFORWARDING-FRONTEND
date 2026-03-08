import axios from "axios";
import type { NoteCollectionInterface } from "@/type/note.interface";
import type { PageOptionsDto, PageMetaDto } from "@/type/general";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const FindAll = async (
  pagination: PageOptionsDto,
  search?:string
): Promise<PageMetaDto<NoteCollectionInterface>> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/note/all`,
    {
      pagination,
      search
    },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const Find = async (
  noteid: string
): Promise<NoteCollectionInterface> => {
  const { data } = await axios.get(`${NEXT_PUBLIC_API_URL}/note/${noteid}`, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
    },
  });

  return data;
};

type UpdateNotePayload = {
  note: string;
  deleted?: boolean;
};

export const UpdateNote = async (
  noteid: string,
  payload: UpdateNotePayload
): Promise<NoteCollectionInterface> => {
  const { data } = await axios.put(
    `${NEXT_PUBLIC_API_URL}/note/${noteid}`,
    payload,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const Update = async (
  noteid: string,
  payloadOrNote: string | UpdateNotePayload
): Promise<NoteCollectionInterface> => {
  const payload =
    typeof payloadOrNote === "string"
      ? { note: payloadOrNote, deleted: false }
      : payloadOrNote;

  return UpdateNote(noteid, payload);
};

export const Delete = async (
  noteid: string
): Promise<NoteCollectionInterface> => {
  const { data } = await axios.put(
    `${NEXT_PUBLIC_API_URL}/note/${noteid}`,
    { deleted: true },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const Create = async (
  note: string
): Promise<NoteCollectionInterface> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/note`,
    { note },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};
