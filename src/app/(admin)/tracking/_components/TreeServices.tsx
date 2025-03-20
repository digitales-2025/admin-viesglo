"use client";

import { useCallback, useState } from "react";
import { Download, File, Folder, FolderOpen, Globe, Share2, Trash2 } from "lucide-react";

import TreeView, { TreeViewItem, TreeViewMenuItem } from "@/shared/components/tree-view";

export const test_data = [
  {
    id: "science",
    name: "Science",
    type: "region",
    children: [
      {
        id: "physics",
        name: "Physics",
        type: "store",
        children: [
          {
            id: "mechanics",
            name: "Mechanics",
            type: "department",
            children: [
              { id: "newton1", name: "Newton's First Law", type: "item" },
              { id: "newton2", name: "Newton's Second Law", type: "item" },
              { id: "newton3", name: "Newton's Third Law", type: "item" },
              { id: "momentum", name: "Conservation of Momentum", type: "item" },
            ],
          },
          {
            id: "thermo",
            name: "Thermodynamics",
            type: "department",
            children: [
              { id: "thermo1", name: "First Law of Thermodynamics", type: "item" },
              { id: "thermo2", name: "Second Law of Thermodynamics", type: "item" },
              { id: "entropy", name: "Entropy", type: "item" },
            ],
          },
        ],
      },
      {
        id: "chemistry",
        name: "Chemistry",
        type: "store",
        children: [
          {
            id: "organic",
            name: "Organic Chemistry",
            type: "department",
            children: [
              { id: "alkanes", name: "Alkanes", type: "item" },
              { id: "alkenes", name: "Alkenes", type: "item" },
              { id: "alcohols", name: "Alcohols", type: "item" },
              { id: "ketones", name: "Ketones", type: "item" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "math",
    name: "Mathematics",
    type: "region",
    children: [
      {
        id: "algebra",
        name: "Algebra",
        type: "store",
        children: [
          {
            id: "linear",
            name: "Linear Algebra",
            type: "department",
            children: [
              { id: "matrices", name: "Matrices", type: "item" },
              { id: "vectors", name: "Vectors", type: "item" },
              { id: "eigen", name: "Eigenvalues", type: "item" },
            ],
          },
          {
            id: "abstract",
            name: "Abstract Algebra",
            type: "department",
            children: [
              { id: "groups", name: "Group Theory", type: "item" },
              { id: "rings", name: "Ring Theory", type: "item" },
              { id: "fields", name: "Field Theory", type: "item" },
              { id: "galois", name: "Galois Theory", type: "item" },
            ],
          },
        ],
      },
    ],
  },
];

export default function Home() {
  const [treeData, setTreeData] = useState<TreeViewItem[]>(test_data);

  const customIconMap = {
    region: <Globe className="h-4 w-4 text-purple-500" />,
    store: <Folder className="h-4 w-4 text-blue-500" />,
    department: <FolderOpen className="h-4 w-4 text-green-500" />,
    item: <File className="h-4 w-4 text-orange-500" />,
  };

  const getCheckedItems = useCallback((items: TreeViewItem[]): TreeViewItem[] => {
    let checkedItems: TreeViewItem[] = [];

    items.forEach((item) => {
      if (item.checked) {
        // If this item is checked, add only it and skip its children
        checkedItems.push(item);
      } else if (item.children) {
        // If this item is not checked, check its children
        checkedItems = [...checkedItems, ...getCheckedItems(item.children)];
      }
    });

    return checkedItems;
  }, []);

  const handleCheckChange = (items: TreeViewItem | TreeViewItem[], checked: boolean) => {
    const itemsArray = Array.isArray(items) ? items : [items];

    const updateCheckState = (treeItems: TreeViewItem[]): TreeViewItem[] => {
      return treeItems.map((currentItem) => {
        if (itemsArray.some((item) => item.id === currentItem.id)) {
          if (currentItem.children) {
            return {
              ...currentItem,
              checked,
              children: updateAllChildren(currentItem.children, checked),
            };
          }
          return { ...currentItem, checked };
        }
        if (currentItem.children) {
          return {
            ...currentItem,
            children: updateCheckState(currentItem.children),
          };
        }
        return currentItem;
      });
    };

    const updateAllChildren = (children: TreeViewItem[], checked: boolean): TreeViewItem[] => {
      return children.map((child) => ({
        ...child,
        checked,
        children: child.children ? updateAllChildren(child.children, checked) : undefined,
      }));
    };

    setTreeData((prevData) => updateCheckState(prevData));
  };

  const handleAction = (action: string, items: TreeViewItem[]) => {
    if (action === "add_to_shipment" && items.length > 0) {
      handleCheckChange(items, true);
    }
  };

  // const checkedItems = getCheckedItems(treeData);

  const menuItems: TreeViewMenuItem[] = [
    {
      id: "add_to_shipment",
      label: "Add to Shipment",
      icon: <Share2 className="h-4 w-4" />,
      action: (items) => handleCheckChange(items, true),
    },
    {
      id: "download",
      label: "Download",
      icon: <Download className="h-4 w-4" />,
      action: (items) => console.log("Downloading:", items),
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4 text-red-500" />,
      action: (items) => console.log("Deleting:", items),
    },
  ];

  return (
    <TreeView
      data={treeData}
      className="max-h-[450px] overflow-y-auto"
      title="Retail Store Hierarchy"
      iconMap={customIconMap}
      showCheckboxes={true}
      onCheckChange={handleCheckChange}
      onAction={handleAction}
      menuItems={menuItems}
    />
  );
}
