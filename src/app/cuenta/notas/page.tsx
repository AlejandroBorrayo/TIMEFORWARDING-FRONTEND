"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PageOptionsDto } from "@/type/general";
import { formatDateDMY } from "@/app/utils";
import { FindAll, Delete, Update, Create } from "@/services/note";
import ModalNote from "@/components/noteModal";
import { NoteCollectionInterface } from "../../../type/note.interface";
import ModalConfirmDeleteNote from "@/components/confirmDeleteNoteModal";

const PAGE_SIZE = 5;

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteCollectionInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteNoteId, setDeleteNoteId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<{ note: string; _id: string }>(
    null
  );

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const pagination: PageOptionsDto = {
        page,
        perpage: PAGE_SIZE,
      };

      const res = await FindAll(pagination);
      setNotes(res?.records);
      setTotalPages(res.totalpages);
    } catch (error) {
      console.error("Error cargando notas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await Delete(id);
      fetchNotes();
    } catch (error) {
      console.error("Error eliminando nota:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [page]);

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h1
        className="text-2xl font-semibold mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Notas
      </motion.h1>

      {/* Acción */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            setEditingNote(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-[#02101d] text-white rounded-xl cursor-pointer"
        >
          Nueva nota
        </button>
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-1/2" />
            <col className="w-1/2" />
          </colgroup>
          <thead>
            <tr className="bg-gray-100"></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-2 text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : (
              notes.map((note, i) => (
                <motion.tr
                  key={note._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td colSpan={2} className="px-4 py-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{note.note}</span>

                      <div className="flex gap-2">
                    {/*     <button
                          onClick={() => {
                            setEditingNote({ note: note.note, _id: note._id });
                            setShowModal(true);
                          }}
                          className="px-3 py-1 text-sm bg-[#02101d] text-white rounded-xl cursor-pointer"
                        >
                          Editar
                        </button> */}

                    {/*     <button
                          onClick={() => {
                            setShowDeleteModal(true)
                            setDeleteNoteId(note._id)
                          }}
                          className="px-3 py-1 text-sm border rounded-xl hover:bg-red-50 text-red-600 cursor-pointer"
                        >
                          Eliminar
                        </button> */}
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="md:hidden flex flex-col gap-4">
        <AnimatePresence>
          {loading ? (
            <motion.div
              className="text-center py-6 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Cargando...
            </motion.div>
          ) : (
            notes.map((note) => (
              <motion.div
                key={note._id}
                className="bg-white border rounded-xl p-4 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <p className="font-semibold mb-1">{note.note}</p>

{/*                 <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingNote({ note: note.note, _id: note._id });
                      setShowModal(true);
                    }}
                    className="px-3 py-1 text-sm bg-[#02101d] text-white rounded-xl"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setDeleteNoteId(note._id);
                      setShowDeleteModal(true);
                    }}
                    className="px-3 py-1 text-sm border rounded-xl text-red-600"
                  >
                    Eliminar
                  </button>
                </div> */}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Paginación */}
      <div className="flex justify-end items-center gap-2 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded-xl disabled:opacity-50"
        >
          Anterior
        </button>

        <span className="text-sm">
          {page} / {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded-xl disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      <ModalNote
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingNote(null);
        }}
        initialData={editingNote}
        onSubmit={async (data) => {
          if (editingNote) {
            await Update(editingNote._id, data?.note);
          } else {
            await Create(data?.note);
          }
          fetchNotes();
        }}
      />
      <ModalConfirmDeleteNote
      type="note"
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          await handleDelete(deleteNoteId);
          setShowDeleteModal(false);
        }}
      />
    </motion.div>
  );
}
