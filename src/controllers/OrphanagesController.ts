import { Request, Response } from "express";
import { getRepository } from "typeorm";
import Orphanage from "../models/Orphanage";
import orphanageView from "../views/orphanages_view";
import * as Yup from "yup";
import getValidationErrors from "../utils/getValidationErrors";

export default {
  async index(request: Request, response: Response) {
    const orphanagesRepository = getRepository(Orphanage);
    const orphanages = await orphanagesRepository.find({
      relations: ["images"],
    });

    return response.status(200).json(orphanageView.renderMany(orphanages));
  },

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const orphanagesRepository = getRepository(Orphanage);

    const orphanage = await orphanagesRepository.findOneOrFail(id, {
      relations: ["images"],
    });

    return response.status(200).json(orphanageView.render(orphanage));
  },

  async create(request: Request, response: Response) {
    console.log(request.files);

    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
    } = request.body;

    const orphanagesRepository = getRepository(Orphanage);

    const requestImages = request.files as Express.Multer.File[];

    const images = requestImages.map((image) => {
      return {
        path: image.filename,
      };
    });

    try {
      const data = {
        name,
        latitude,
        longitude,
        about,
        instructions,
        opening_hours,
        open_on_weekends: open_on_weekends === "true",
        images,
      };

      const schema = Yup.object().shape({
        name: Yup.string().required(),
        latitude: Yup.number(),
        longitude: Yup.number().when("latitude", (latitude, schema) => {
          return schema.test({
            test: (longitude) => latitude !== 0 || longitude !== 0,
            message: "Latitude e Longitude devem ser válidos",
          });
        }),
        about: Yup.string().required().max(300),
        instructions: Yup.string().required(),
        opening_hours: Yup.string().required(),
        open_on_weekends: Yup.boolean().required(),
        images: Yup.array(
          Yup.object().shape({
            path: Yup.string().required(),
          })
        ).required(),
      });

      await schema.validate(data, {
        abortEarly: false,
      });

      const orphanage = orphanagesRepository.create(data);

      console.log(orphanage);

      await orphanagesRepository.save(orphanage);

      return response.status(201).json(orphanage);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errors = getValidationErrors(error);
        console.log(errors);
        return response.status(400).json(errors);
      }
    }
  },
};
