import { useEffect, useState, useMemo } from "react";
import { getAllDocuments } from "../services/api";
import { useNavigate } from "react-router-dom";

import pdfIcon from "/icons/pdf.png";
import wordIcon from "/icons/word.png";
import excelIcon from "/icons/excel.png";
import imageIcon from "/icons/image.png";

import "../styles/table.css";

const PAGE_SIZE = 5;

export default function DocumentTable({ refresh, isAdmin }) {
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

const navigate = useNavigate();

  useEffect(() => {
    getAllDocuments().then(setDocs);
  }, [refresh]);

  const icon = (mime = "") => {
  mime = mime.toLowerCase();

  if (mime.includes("pdf")) return pdfIcon;

  if (
    mime.includes("word") ||
    mime.includes("officedocument.wordprocessingml")
  )
    return wordIcon;

  if (
    mime.includes("excel") ||
    mime.includes("spreadsheet") ||
    mime.includes("officedocument.spreadsheetml")
  )
    return excelIcon;

  if (mime.includes("image")) return imageIcon;

  return pdfIcon;
};


  /* 🔍 SEARCH + FILTER */
 const filteredDocs = useMemo(() => {
  return docs.filter(d => {
    const name = d.file_name?.toLowerCase() || "";
    const mime = d.file_type?.toLowerCase() || "";

    const matchSearch =
      name.includes(search.toLowerCase()) ||
      mime.includes(search.toLowerCase());

    const matchFilter = (() => {
      if (filter === "all") return true;

      if (filter === "pdf") return mime.includes("pdf");

      if (filter === "word")
        return (
          mime.includes("word") ||
          mime.includes("officedocument.wordprocessingml")
        );

      if (filter === "excel")
        return (
          mime.includes("excel") ||
          mime.includes("spreadsheet") ||
          mime.includes("officedocument.spreadsheetml")
        );

      if (filter === "image") return mime.includes("image");

      return true;
    })();

    return matchSearch && matchFilter;
  });
}, [docs, search, filter]);
;

  /* 📄 PAGINATION */
 const totalEntries = filteredDocs.length;
const totalPages = Math.ceil(totalEntries / pageSize);

const startIndex = (page - 1) * pageSize;
const endIndex = Math.min(startIndex + pageSize, totalEntries);

const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

const getPageNumbers = () => {
  const pages = [];
  const maxVisible = 7;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);

    if (page > 4) pages.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 3) pages.push("...");

    pages.push(totalPages);
  }
  return pages;
};



  return (
    <div className="tableCard">
      <h3>Uploaded Documents</h3>

      {/* SEARCH + FILTER BAR */}
      <div className="tableControls">
        <input
          className="searchInput"
          placeholder="Search by name or MIME..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <div className="filters">
          {["all", "pdf", "word", "excel", "image"].map(f => (
            <button
              key={f}
              className={filter === f ? "filterBtn active" : "filterBtn"}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* INFO */}
      <div className="tableTop">
        <div className="entriesSelect">
          Show
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          entries
        </div>

        {/* <input
          className="searchInput"
          placeholder="Search by name or MIME..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
        /> */}
      </div>


      {/* TABLE */}
      <table className="dataTable">
        <thead>
          <tr>
            <th>S.No</th>
            <th>File</th>
            <th>MIME</th>
            <th>Status</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedDocs.map((d, index) => (
            <tr key={d.id}>
              <td>{startIndex + index + 1}</td>
              <td>
                <div className="alignCenter">
                  <img src={icon(d.file_type)} alt={d.file_type} className="fileIcon" width={26} height={26} /> 
                  {d.file_name}
                </div>
              </td>
              <td>{d.file_type}</td>
              <td>{d.status}</td>
              <td>{d.document_category}</td>
              <td>
               <div className="actionBtns">
               <button
              className="btn btn-primary"
                 onClick={() => navigate(`/documents/view/${d.id}`)}> 👁 </button>

            {isAdmin && (
               <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/documents/edit/${d.id}`)}>✎</button>
                 )}
              </div>
             </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="tableBottom">
        <div className="tableInfo">
          Showing {startIndex + 1} to {endIndex} of {totalEntries} entries
        </div>


      {/* PAGINATION */}
     <div className="pagination">
  <button disabled={page === 1} onClick={() => setPage(page - 1)}>
    &lt;
  </button>

  {getPageNumbers().map((p, i) =>
    p === "..." ? (
      <span key={i} className="dots">...</span>
    ) : (
      <button
        key={i}
        className={p === page ? "active" : ""}
        onClick={() => setPage(p)}
      >
        {p}
      </button>
    )
  )}

  <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
    &gt;
  </button>
</div>
</div>

    </div>
  );
}
