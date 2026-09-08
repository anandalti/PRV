
const TagRevisions = require('../models/TagRevisions');

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  
  function deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
  
    if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 == null || obj2 == null)
      return false;
  
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) return false;
  
    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }
  
    return true;
  }
  
  function deepEqualArray(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (!deepEqual(arr1[i], arr2[i])) return false;
    }
    return true;
  }

const getAllTagRevisions = async (req, res) => {
    const data = await TagRevisions.getAllTagRevisions();
    res.json(data);
};
const getTagRevisions = async (req, res) => {
    const data = await TagRevisions.getTagRevisionsById(req.params.id);
    res.json(data);
};
const createTagRevisions = async (req, res) => {
    const data = new TagRevisions(req.body);
    const newTagRevisions = await TagRevisions.createTagRevisions(data);
    res.json(newTagRevisions);
};
const updateTagRevisions = async (req, res) => {
    const data = new TagRevisions(req.body);
    const updatedTagRevisions = await TagRevisions.updateTagRevisions(req.params.id, data);
    res.json(updatedTagRevisions);
};
const deleteTagRevisions = async (req, res) => {
    const deletedTagRevisions = await TagRevisions.deleteTagRevisions(req.params.id);
    res.json(deletedTagRevisions);
};


const updateAll = async (req, res) => {
    try {
      const { revisionsData, sizingId: SizingId } = req.body;
  
      const newData = Array.isArray(revisionsData) ? revisionsData.map((rev) => {
        const {
          id: Id,
          number: Number,
          revision: Revision,
          preparedBy: PreparedBy,
          checkedBy: CheckedBy,
          approvedBy: ApprovedBy,
          date: Date
        } = rev;
        return {
          Id,
          SizingId,
          Number,
          PreparedBy,
          CheckedBy,
          ApprovedBy,
          Date: formatDate(Date),
          Revision
        };
      }) : [];
  
      let tagRevisions = await TagRevisions.getTagRevisionsBySizingId(SizingId);
      tagRevisions = tagRevisions.map((rev) => ({
        Id: rev.Id,
        SizingId: rev.SizingId,
        Number: rev.Number,
        PreparedBy: rev.PreparedBy,
        CheckedBy: rev.CheckedBy,
        ApprovedBy: rev.ApprovedBy,
        Date: formatDate(rev.Date),
        Revision: rev.Revision
      }));
      if (deepEqualArray(newData, tagRevisions)) {
        return res.status(200).json({ message: 'No changes detected' });
      } else {
        await TagRevisions.deleteTagRevisionsBySizingId(SizingId);
        await TagRevisions.updateTagrevisionsbySizingdata(JSON.stringify(newData));
        return res.status(200).json({ message: 'Data updated successfully' });
      }
  
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: 'invalid payload' });
    }
  };

module.exports = {
    getAllTagRevisions,
    getTagRevisions,
    createTagRevisions,
    updateTagRevisions,
    updateAll,
    deleteTagRevisions
};
