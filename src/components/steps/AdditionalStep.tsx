import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Award, Plus, Trash2 } from "lucide-react";
import { ResumeData } from "@/types/ResumeData";

interface AdditionalStepProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  validationErrors: { [key: string]: string };
}

export const AdditionalStep: React.FC<AdditionalStepProps> = ({
  resumeData,
  setResumeData,
  validationErrors,
}) => {
  // Certifications
  const addCertification = () => {
    const newCert = {
      id: Math.random().toString(36).substring(2, 11),
      name: "",
      issuer: "",
      date: "",
      url: "",
    };
    setResumeData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, newCert],
    }));
  };

  const updateCertificationField = (
    certId: string,
    field: "name" | "issuer" | "date" | "url",
    value: string
  ) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) =>
        c.id === certId
          ? {
              ...c,
              [field]: value,
            }
          : c
      ),
    }));
  };

  const removeCertification = (certId: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== certId),
    }));
  };

  // Languages
  const addLanguage = () => {
    const newLang = {
      id: Math.random().toString(36).substring(2, 11),
      name: "",
      proficiency: "",
    };
    setResumeData((prev) => ({
      ...prev,
      languages: [...prev.languages, newLang],
    }));
  };

  const updateLanguageField = (
    langId: string,
    field: "name" | "proficiency",
    value: string
  ) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.map((l) =>
        l.id === langId
          ? {
              ...l,
              [field]: value,
            }
          : l
      ),
    }));
  };

  const removeLanguage = (langId: string) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l.id !== langId),
    }));
  };

  // Custom Sections
  const addCustomSection = () => {
    const newSection = {
      id: Math.random().toString(36).substring(2, 11),
      title: "",
      items: [],
    };
    setResumeData((prev) => ({
      ...prev,
      customSections: [...prev.customSections, newSection],
    }));
  };

  const updateCustomSectionField = (
    sectionId: string,
    field: "title",
    value: string
  ) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: prev.customSections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              [field]: value,
            }
          : s
      ),
    }));
  };

  const removeCustomSection = (sectionId: string) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((s) => s.id !== sectionId),
    }));
  };

  // Custom Section Items
  const addCustomSectionItem = (sectionId: string) => {
    const newItem = {
      title: "",
      subtitle: "",
      description: "",
      date: "",
      location: "",
      details: [],
    };
    setResumeData((prev) => ({
      ...prev,
      customSections: prev.customSections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: [...s.items, newItem],
            }
          : s
      ),
    }));
  };

  const updateCustomSectionItem = (
    sectionId: string,
    itemIndex: number,
    field: "title" | "subtitle" | "description" | "date" | "location",
    value: string
  ) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: prev.customSections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((item, idx) =>
                idx === itemIndex
                  ? {
                      ...item,
                      [field]: value,
                    }
                  : item
              ),
            }
          : s
      ),
    }));
  };

  const addCustomSectionItemDetail = (sectionId: string, itemIndex: number) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: prev.customSections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((item, idx) =>
                idx === itemIndex
                  ? {
                      ...item,
                      details: [...(item.details || []), ""],
                    }
                  : item
              ),
            }
          : s
      ),
    }));
  };

  const updateCustomSectionItemDetail = (
    sectionId: string,
    itemIndex: number,
    detailIndex: number,
    value: string
  ) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: prev.customSections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((item, idx) =>
                idx === itemIndex
                  ? {
                      ...item,
                      details: (item.details || []).map((detail, dIdx) =>
                        dIdx === detailIndex ? value : detail
                      ),
                    }
                  : item
              ),
            }
          : s
      ),
    }));
  };

  const removeCustomSectionItemDetail = (
    sectionId: string,
    itemIndex: number,
    detailIndex: number
  ) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: prev.customSections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((item, idx) =>
                idx === itemIndex
                  ? {
                      ...item,
                      details: (item.details || []).filter((_, dIdx) => dIdx !== detailIndex),
                    }
                  : item
              ),
            }
          : s
      ),
    }));
  };

  const removeCustomSectionItem = (sectionId: string, itemIndex: number) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: prev.customSections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.filter((_, idx) => idx !== itemIndex),
            }
          : s
      ),
    }));
  };

  const renderCertificationsSection = () => (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Certifications</CardTitle>
        <CardDescription>Professional certifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {resumeData.certifications.length === 0 && (
            <p className="text-muted-foreground text-sm italic">No certifications added yet. Click the button below to add your certifications.</p>
          )}
          {resumeData.certifications.map((cert) => (
            <div key={cert.id} className="p-4 border rounded-lg space-y-4 bg-muted/50">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-foreground">Certification</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(cert.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Certification Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={cert.name}
                    onChange={(e) => updateCertificationField(cert.id, "name", e.target.value)}
                    className={`input-enhanced h-10 ${validationErrors[`certification_${cert.id}_name`] ? "border-red-500" : ""}`}
                    placeholder="e.g., AWS Solutions Architect"
                  />
                  {validationErrors[`certification_${cert.id}_name`] && (
                    <p className="text-xs text-red-500">{validationErrors[`certification_${cert.id}_name`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Issuer <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={cert.issuer}
                    onChange={(e) => updateCertificationField(cert.id, "issuer", e.target.value)}
                    className={`input-enhanced h-10 ${validationErrors[`certification_${cert.id}_issuer`] ? "border-red-500" : ""}`}
                    placeholder="e.g., Amazon Web Services"
                  />
                  {validationErrors[`certification_${cert.id}_issuer`] && (
                    <p className="text-xs text-red-500">{validationErrors[`certification_${cert.id}_issuer`]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Date
                  </Label>
                  <Input
                    type="month"
                    value={cert.date}
                    onChange={(e) => updateCertificationField(cert.id, "date", e.target.value)}
                    className="input-enhanced h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Certificate URL</Label>
                  <Input
                    value={cert.url}
                    onChange={(e) => updateCertificationField(cert.id, "url", e.target.value)}
                    className="input-enhanced h-10"
                    placeholder="https://certificate-url.com"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button onClick={addCertification} variant="outline" className="button-enhanced w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderLanguagesSection = () => (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Languages</CardTitle>
        <CardDescription>Spoken languages and proficiency</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {resumeData.languages.length === 0 && (
            <p className="text-muted-foreground text-sm italic">No languages added yet. Click the button below to add your languages.</p>
          )}
          {resumeData.languages.map((lang) => (
            <div key={lang.id} className="p-4 border rounded-lg space-y-4 bg-muted/50">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-foreground">Language</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLanguage(lang.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Language <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={lang.name}
                    onChange={(e) => updateLanguageField(lang.id, "name", e.target.value)}
                    className={`input-enhanced h-10 ${validationErrors[`language_${lang.id}_name`] ? "border-red-500" : ""}`}
                    placeholder="e.g., English"
                  />
                  {validationErrors[`language_${lang.id}_name`] && (
                    <p className="text-xs text-red-500">{validationErrors[`language_${lang.id}_name`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Proficiency <span className="text-red-500">*</span>
                  </Label>
                  <Select value={lang.proficiency} onValueChange={(value) => updateLanguageField(lang.id, "proficiency", value)}>
                    <SelectTrigger className={`h-10 ${validationErrors[`language_${lang.id}_proficiency`] ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select proficiency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="native">Native</SelectItem>
                      <SelectItem value="fluent">Fluent</SelectItem>
                      <SelectItem value="proficient">Proficient</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors[`language_${lang.id}_proficiency`] && (
                    <p className="text-xs text-red-500">{validationErrors[`language_${lang.id}_proficiency`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Button onClick={addLanguage} variant="outline" className="button-enhanced w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Language
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCustomSections = () => (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Additional Sections</CardTitle>
        <CardDescription>Any extra sections you want to include</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {resumeData.customSections.length === 0 && (
            <p className="text-muted-foreground text-sm italic">No additional sections added yet. Click the button below to add custom sections.</p>
          )}
          {resumeData.customSections.map((section) => (
            <div key={section.id} className="p-4 border rounded-lg space-y-4 bg-muted/50">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-foreground">Custom Section</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomSection(section.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Section Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={section.title}
                  onChange={(e) => updateCustomSectionField(section.id, "title", e.target.value)}
                  className={`input-enhanced h-10 ${validationErrors[`customSection_${section.id}_title`] ? "border-red-500" : ""}`}
                  placeholder="e.g., Volunteer Experience"
                />
                {validationErrors[`customSection_${section.id}_title`] && (
                  <p className="text-xs text-red-500">{validationErrors[`customSection_${section.id}_title`]}</p>
                )}
              </div>

              {/* Section Items */}
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Items</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCustomSectionItem(section.id)}
                    className="h-8"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Item
                  </Button>
                </div>

                {section.items.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No items added. Click &quot;Add Item&quot; to add entries to this section.
                  </p>
                )}

                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="p-3 border rounded-md space-y-3 bg-background"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-muted-foreground">
                        Item {itemIndex + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomSectionItem(section.id, itemIndex)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Title</Label>
                        <Input
                          value={item.title || ""}
                          onChange={(e) =>
                            updateCustomSectionItem(
                              section.id,
                              itemIndex,
                              "title",
                              e.target.value
                            )
                          }
                          className="input-enhanced h-9 text-sm"
                          placeholder="e.g., Position or Activity Name"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Subtitle</Label>
                        <Input
                          value={item.subtitle || ""}
                          onChange={(e) =>
                            updateCustomSectionItem(
                              section.id,
                              itemIndex,
                              "subtitle",
                              e.target.value
                            )
                          }
                          className="input-enhanced h-9 text-sm"
                          placeholder="e.g., Organization"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Date</Label>
                        <Input
                          value={item.date || ""}
                          onChange={(e) =>
                            updateCustomSectionItem(
                              section.id,
                              itemIndex,
                              "date",
                              e.target.value
                            )
                          }
                          className="input-enhanced h-9 text-sm"
                          placeholder="e.g., Jan 2023 - Present"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Location</Label>
                        <Input
                          value={item.location || ""}
                          onChange={(e) =>
                            updateCustomSectionItem(
                              section.id,
                              itemIndex,
                              "location",
                              e.target.value
                            )
                          }
                          className="input-enhanced h-9 text-sm"
                          placeholder="e.g., New York, NY"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Description</Label>
                      <Textarea
                        value={item.description || ""}
                        onChange={(e) =>
                          updateCustomSectionItem(
                            section.id,
                            itemIndex,
                            "description",
                            e.target.value
                          )
                        }
                        className="input-enhanced min-h-[60px] text-sm"
                        placeholder="Brief description..."
                      />
                    </div>

                    {/* Details/Bullet Points */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-medium">Details (Bullet Points)</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addCustomSectionItemDetail(section.id, itemIndex)}
                          className="h-6 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Detail
                        </Button>
                      </div>

                      {(item.details || []).length === 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          No bullet points added.
                        </p>
                      )}

                      {(item.details || []).map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex gap-2">
                          <Input
                            value={detail}
                            onChange={(e) =>
                              updateCustomSectionItemDetail(
                                section.id,
                                itemIndex,
                                detailIndex,
                                e.target.value
                              )
                            }
                            className="input-enhanced h-8 text-sm flex-1"
                            placeholder={`Detail ${detailIndex + 1}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeCustomSectionItemDetail(section.id, itemIndex, detailIndex)
                            }
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button onClick={addCustomSection} variant="outline" className="button-enhanced w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Section
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Additional Information</h2>
      </div>
      
      {renderCertificationsSection()}
      {renderLanguagesSection()}
      {renderCustomSections()}
    </div>
  );
};

