"use client";

import { useCallback, useState } from "react";
import { Download, File, Folder, FolderOpen, Share2, Trash2 } from "lucide-react";

import TreeView, { TreeViewItem, TreeViewMenuItem } from "@/shared/components/tree-view";

export const test_data = [
  {
    id: "service",
    name: "Service",
    type: "service",
    children: [
      {
        id: "objective",
        name: "Objective",
        type: "objective",
        children: [{ id: "activity", name: "Activity", type: "activity" }],
      },
    ],
  },
];

export default function Home() {
  const [treeData, setTreeData] = useState<TreeViewItem[]>(test_data);

  const customIconMap = {
    service: <Folder className="h-4 w-4 text-blue-500" />,
    objective: <FolderOpen className="h-4 w-4 text-green-500" />,
    activity: <File className="h-4 w-4 text-teal-500" />,
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
